# Project 02: South Florida Spending Explorer

## Goal

Build and deploy a useful serverless web app that explores public federal spending connected to South Florida communities. This project extends the Lambda and API Gateway concepts from the [Serverless API Overview](../project-01-serverless-api-overview/README.md) into a finished AWS SAM application for the [September 9, 2026 AWS User Group West Palm Beach meetup](https://www.meetup.com/aws-west-palm-beach-user-group/events/316379163/).

The finished app lets a user select Palm Beach, Broward, or Miami-Dade County and a fiscal year. It calls USASpending.gov and presents a limited list of the largest matching awards in a browser.

## Objectives

- Define repeatable infrastructure with AWS SAM.
- Understand the API Gateway to Lambda request and response path.
- Validate user input and safely call an external public API.
- Deploy an application that can be opened from a single URL.
- Practice checking identity, estimating cost, observing errors, and cleaning up AWS resources.

## Prerequisites

- Complete [Lab 01 - AWS CLI Basics](../../labs/lab-01-aws-cli-basics/README.md).
- Read [AWS Prerequisites](../../docs/AWS-PREREQUISITES.md).
- Install AWS CLI, AWS SAM CLI, Docker, and Node.js 24 or newer.
- Have an AWS account with MFA enabled and permission to create a Lambda function, HTTP API, and CloudFormation stack.

## Architecture

```text
Browser
  |
  | GET /
  | GET /api/spending?county=...&fiscalYear=...
  v
API Gateway HTTP API
  |
  v
Lambda: SpendingExplorerFunction
  |
  | POST /api/v2/search/spending_by_award/
  v
USASpending.gov API
```

The same Lambda serves the dependency-free HTML page and the JSON endpoint. The first version has no database and performs only bounded read-only requests.

## Milestones

1. Review `template.yaml` and identify the API Gateway routes, Lambda runtime, timeout, and output URL.
2. Run `sam validate --lint` and `sam build` from [the sample application](../../sample-code/south-florida-spending-explorer/README.md).
3. Invoke the function with `events/example.json` and describe the response fields.
4. Start the local API and test the browser page and JSON route.
5. Deploy with an explicit stack name and region after checking `aws sts get-caller-identity`.
6. Test at least two counties and one invalid request against the deployed URL.
7. Inspect the CloudFormation output and function logs, then delete the stack.

## Definition Of Done

- [ ] The SAM template validates and builds successfully.
- [ ] The local function returns a JSON response for the example event.
- [ ] Invalid county and fiscal-year inputs return a clear client error.
- [ ] The deployed page loads from the API Gateway URL.
- [ ] At least one live South Florida query displays results or a clear empty state.
- [ ] USASpending.gov is credited and its data limitations are documented.
- [ ] Cleanup is completed and documented.
- [ ] README updated with observations or improvements.

## Troubleshooting

Start with the [sample application README](../../sample-code/south-florida-spending-explorer/README.md). For AWS identity, credentials, and `AccessDenied` problems, review [Troubleshooting](../../docs/TROUBLESHOOTING.md).

## Stretch Task

Choose one extension and document its tradeoffs:

- Cache repeated searches in DynamoDB.
- Add a spending-by-agency chart.
- Add an award detail endpoint.
- Add CloudWatch metrics and alarms.
- Protect a private variant with authentication.

Record what new IAM permissions, cost, failure modes, and cleanup steps the extension introduces.
