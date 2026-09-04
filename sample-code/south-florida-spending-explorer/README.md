# South Florida Spending Explorer

A small AWS SAM application for the [AWS User Group West Palm Beach meetup on September 9, 2026](https://www.meetup.com/aws-west-palm-beach-user-group/events/316379163/). It demonstrates how Lambda and API Gateway can turn a public data source into a useful local web experience.

The app asks USASpending.gov for the largest federal awards associated with places of performance in Palm Beach, Broward, or Miami-Dade County. It serves a browser page and a JSON API from the same Lambda function.

## What You Will Learn

- Define an API and Lambda function with AWS SAM.
- Validate inputs before sending them to an upstream API.
- Call a public HTTP API from Lambda.
- Return JSON and HTML through API Gateway.
- Build, deploy, test, and clean up a serverless application.

## Prerequisites

- An AWS account with MFA enabled.
- AWS CLI configured for the account you intend to use.
- AWS SAM CLI installed.
- Node.js 24 or newer for local JavaScript checks.

From the repository root, verify your AWS identity before deploying:

```bash
aws sts get-caller-identity
```

Confirm that the returned account and ARN are the account where you want to create the stack.

## Project Files

- `template.yaml`: SAM infrastructure definition.
- `src/handler.mjs`: API and static page handler.
- `web/index.html`: dependency-free browser interface.
- `events/example.json`: sample event for local invocation.

## Build And Validate

Run these commands from this directory:

```bash
sam validate --lint
sam build
```

`sam build` creates generated files under `.aws-sam/`. They are ignored by Git and can be removed at any time.

## Invoke Locally

`sam local` runs Lambda inside a container. It requires Docker or Finch to be installed and running. This is separate from `sam validate`, `sam build`, and `sam deploy`, which do not require a local container for this application.

### WSL With Docker Desktop

If you are using WSL 2 with Docker Desktop on Windows:

1. Open Docker Desktop and wait until its engine reports **Running**.
2. In Docker Desktop, enable WSL integration for the Linux distribution you are using.
3. Restart the WSL terminal.
4. Verify the daemon is reachable:

```bash
docker version
docker run --rm hello-world
```

Both commands should complete without a connection error. If `docker version` shows only a `Client` section, or reports that the daemon is unavailable, start Docker Desktop and check its WSL integration settings. Do not use `sudo sam` or `sudo docker` for this workflow; SAM needs to use the same Docker context available to your normal WSL user.

If Docker Desktop is not part of your setup, install Docker Engine inside WSL or install Finch, start its VM/runtime, and confirm that `docker version` succeeds before continuing.

The example event queries Palm Beach County for fiscal year 2025:

```bash
sam local invoke SpendingExplorerFunction --event events/example.json
```

The response is an API Gateway-shaped object containing `statusCode`, headers, and a JSON body with `county`, `fiscalYear`, `resultCount`, `returnedAmount`, and `results`.

To test the browser and API together, start a local API after building:

```bash
sam local start-api
```

In another terminal, open the printed local URL or test the JSON route:

```bash
curl "http://127.0.0.1:3000/api/spending?county=palm-beach&fiscalYear=2025"
```

The first request may take a little longer while the container starts. A local Docker installation is required for `sam local` commands.

### AWS CloudShell Limitation

CloudShell is a convenient place to clone the repository, run `sam validate`, run `sam build`, and deploy with `sam deploy`. It does not provide the Docker or Finch runtime required by `sam local invoke` and `sam local start-api`, and it cannot expose a local port for a browser on your computer.

For a CloudShell-only workflow, skip the local-container section and deploy the application. Use the CloudFormation output URL to test the real browser page and API after deployment. Keep the CloudShell terminal active while commands are running; CloudShell sessions can end after inactivity and have limited persistent storage.

### Test The Web Page

Leave `sam local start-api` running and open [http://127.0.0.1:3000/](http://127.0.0.1:3000/) in a browser. Choose a county and fiscal year, then choose **Find awards**. The page calls the local `/api/spending` route, which makes the outbound request to USASpending.gov from the Lambda container.

You can also check the page and API separately:

```bash
curl -i http://127.0.0.1:3000/
curl -i "http://127.0.0.1:3000/api/spending?county=miami-dade&fiscalYear=2024"
```

The first command should return `content-type: text/html`; the second should return JSON. Stop the local server with `Ctrl+C` when finished.

## Deploy

Use an explicit stack name and region. Replace the region if your group is using a different one:

```bash
sam deploy --guided --stack-name south-florida-spending-explorer --region us-east-1 --capabilities CAPABILITY_IAM
```

Accept the suggested settings when prompted. SAM stores the choices in `samconfig.toml`; review that file before committing it if you create one. It contains deployment settings, but never add credentials or secrets to the repository.

After deployment, retrieve the application URL from the CloudFormation output:

```bash
aws cloudformation describe-stacks \
  --stack-name south-florida-spending-explorer \
  --query "Stacks[0].Outputs[?OutputKey=='SpendingExplorerUrl'].OutputValue" \
  --output text
```

Open that URL in a browser. The page should load without a separate frontend deployment. Test another county by changing the selection or calling the endpoint directly:

```bash
curl "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/api/spending?county=broward&fiscalYear=2024"
```

## Recommended Meetup Workflow

For attendees using CloudShell, use the published application in the Serverless Application Repository and the console deployment path. This avoids local tooling entirely: the attendee selects the application, deploys it into their account, and opens the CloudFormation output URL.

For your demonstration or advanced attendees, use the repository in WSL with Docker Desktop integration:

```bash
aws sts get-caller-identity --profile <YOUR_AWS_PROFILE>
docker version
sam validate --lint
sam build --use-container --profile <YOUR_AWS_PROFILE>
sam local start-api --profile <YOUR_AWS_PROFILE>
```

The `--profile` value must be the local AWS CLI profile name, not an access key or account number. The application does not need AWS credentials for `sam local start-api`, but using the profile consistently is useful when you later run `sam deploy`.

If `sam build --use-container` fails while `docker version` succeeds, run the build without the container option:

```bash
sam build --profile <YOUR_AWS_PROFILE>
```

This application has no native dependencies, so the non-container build is suitable for deployment. You still need a working Docker or Finch runtime for `sam local invoke` and `sam local start-api`.

If SAM still reports that no container runtime is available even though `docker version` shows both Client and Server sections:

```bash
which sam
sam --info
sam --version
```

Update or reinstall the AWS SAM CLI in WSL using the current [AWS SAM CLI installation instructions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html), then restart the WSL terminal. The SAM CLI version used for this guide reports Docker as unavailable on some WSL installations even when the Docker socket itself works. Also confirm that `/var/run/docker.sock` is readable by your normal user and that `docker context show` returns `default`. Avoid running SAM with `sudo`, because that can select a different Docker configuration.

For the meetup, do not make container troubleshooting a prerequisite. Attendees can deploy from the Serverless Application Repository console, or from CloudShell with `sam validate`, `sam build`, and `sam deploy`. CloudShell does not support the local-container commands in this guide; test the deployed URL instead.

## API Contract

`GET /api/spending` accepts these query parameters:

- `county`: `palm-beach`, `broward`, or `miami-dade`.
- `fiscalYear`: an integer from the current year back through the previous ten years.

The Lambda sends a bounded, read-only request to the USASpending API v2 award-search endpoint. It returns at most ten awards, sorted by award amount. Results are not an exhaustive accounting of every award in a county.

The upstream service is public and currently does not require an API key. Its availability, data freshness, and usage policies can change. The app handles upstream failures, but it is still an educational demonstration rather than a production data service.

Data attribution: [USASpending.gov](https://www.usaspending.gov/). Learn more from the [USASpending API documentation](https://api.usaspending.gov/docs/).

## Publish To Serverless Application Repository

The template includes metadata required for publishing this application. Publishing is an organizer or maintainer task; attendees should deploy the published application instead of publishing their own copy during the meetup.

Before publishing, make sure the GitHub URLs in `template.yaml` point to the public repository, the local `README.md` and `../../LICENSE` files are present, and the semantic version has changed from any version already published.

Build and publish with the SAM CLI:

```bash
sam build
sam publish --template-file .aws-sam/build/template.yaml --region us-east-1
```

The command prints the Serverless Application Repository application ARN. By default, a newly published application is private. Make it available to attendees from the [Serverless Application Repository console](https://console.aws.amazon.com/serverlessrepo/home):

1. Open **Published applications** and choose `south-florida-spending-explorer`.
2. Open the **Sharing** tab and edit **Public sharing**.
3. Enable public sharing and confirm the application name.
4. Copy the application page URL or search for the application by name in the attendee account.

Public sharing requires a semantic version and license metadata. This template supplies `SemanticVersion`, `SpdxLicenseId`, and `LicenseUrl`. Do not publish an application containing credentials, private URLs, or personal information.

## Attendee Deployment Paths

### Beginner Path: AWS Console

Use this path when you want attendees to deploy without installing the SAM CLI. They still need an AWS account and permission to create the resources in the template.

1. Open the published application page in the [AWS Serverless Application Repository](https://console.aws.amazon.com/serverlessrepo/home).
2. Choose **Deploy**.
3. Select the attendee's target AWS Region.
4. Enter a unique CloudFormation stack name, such as `south-florida-spending-explorer-yourname`.
5. Review the template and permissions, then acknowledge the IAM resource capability if the console requests it.
6. Choose **Deploy** and wait for the CloudFormation stack to reach `CREATE_COMPLETE`.
7. Open the **Outputs** tab and open `SpendingExplorerUrl` in a new browser tab.
8. Select a county and fiscal year, then run a search.

The deployed stack creates one Lambda function and one API Gateway HTTP API. No attendee API key is required. Each attendee deploys resources into their own AWS account; the published application is only the reusable template and code package.

### Advanced Path: AWS SAM CLI

Attendees who have cloned the repository can use the command-line workflow:

```bash
sam validate --lint
sam build
sam deploy --guided --stack-name south-florida-spending-explorer-yourname --region us-east-1 --capabilities CAPABILITY_IAM
```

When prompted, save the deployment configuration only if desired. Then retrieve the URL:

```bash
aws cloudformation describe-stacks \
  --stack-name south-florida-spending-explorer-yourname \
  --query "Stacks[0].Outputs[?OutputKey=='SpendingExplorerUrl'].OutputValue" \
  --output text
```

This path is useful for demonstrating the template, local containers, repeatable deployments, and infrastructure changes. The console and SAM CLI paths deploy the same application behavior.

## Costs And Cleanup

This application uses API Gateway and Lambda. For a short workshop deployment, usage should normally remain within AWS Free Tier limits, but AWS pricing and account eligibility vary. Check the current AWS pricing pages and set a budget alert if this is a new account.

Delete the stack when finished:

```bash
sam delete --stack-name south-florida-spending-explorer --region us-east-1
```

Confirm the stack is gone:

```bash
aws cloudformation describe-stacks --stack-name south-florida-spending-explorer
```

A `ValidationError` stating that the stack does not exist confirms successful deletion.

## Troubleshooting

- `sam validate` reports a runtime error: update the SAM CLI or confirm that `nodejs24.x` is available in the selected region.
- `sam local invoke` cannot start: install and start Docker, then rerun `sam build`.
- The API returns `400`: use one of the documented county keys and a fiscal year in the supported range.
- The API returns `502` or `504`: retry later; the upstream USASpending service may be unavailable or slow.
- Deployment returns `AccessDenied`: confirm the active identity with `aws sts get-caller-identity` and check that it can create the required CloudFormation, Lambda, and API Gateway resources.
- The deployed page is missing: inspect the function logs with `sam logs -n SpendingExplorerFunction --stack-name south-florida-spending-explorer --region us-east-1 --tail`.

## Stretch Ideas

- Cache recent responses in DynamoDB.
- Add a chart grouped by awarding agency.
- Add a recipient search or award detail route.
- Add structured logging and CloudWatch alarms.
- Put authentication in front of a non-public version.
