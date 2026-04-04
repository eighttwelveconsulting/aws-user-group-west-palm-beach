# Troubleshooting

## Common Problems

### AWS CLI command not found

Install AWS CLI v2 and reopen terminal.

### AccessDenied errors

Confirm the active profile and required permissions.

### Wrong AWS account

Run:

```bash
aws sts get-caller-identity
```

Check account ID before creating resources.
