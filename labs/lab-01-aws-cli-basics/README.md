# Lab 01: AWS CLI Basics

## Objectives

- Configure AWS CLI safely
- Verify active identity
- List S3 buckets
- Practice cost-aware cleanup habits

## Prerequisites

- AWS account with MFA
- AWS CLI v2 installed
- Access to basic read-only AWS permissions

## Estimated Time

45 minutes

## Steps

1. Configure credentials.

```bash
aws configure
```

1. Confirm account identity.

```bash
aws sts get-caller-identity
```

1. List S3 buckets.

```bash
aws s3 ls
```

1. Save your output notes in `sample-code/aws-cli-basics/notes.md`.

## Validation

- `get-caller-identity` returns your account information.
- `aws s3 ls` returns successfully.

## Cleanup

No resources are created in this lab.

## Reflection

- Which command was most useful for confidence checks?
- What guardrails would you add before making changes in AWS?
