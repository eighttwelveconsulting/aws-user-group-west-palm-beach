# AWS Prerequisites

## Account Safety

- Enable MFA on root and IAM users.
- Prefer temporary credentials.
- Use least privilege permissions.

## Region

Use one default region for labs unless the lab says otherwise.

## CLI Setup

```bash
aws configure
aws sts get-caller-identity
```

If `get-caller-identity` fails, review credentials before proceeding.
