# Image Storage Conventions

Store images used by README files and docs under this folder.

## Folder layout

- `assets/images/branding/`: logos and brand assets
- `assets/images/events/`: meetup event banners and screenshots
- `assets/images/labs/`: lab diagrams and walkthrough screenshots

## Naming

Use lowercase kebab-case names:

- `aws-wpb-user-group-logo.png`
- `lab-01-cli-output-example.png`

## Referencing in README files

Use relative paths from the markdown file location.

Example from root README:

```md
![AWS User Group West Palm Beach Logo](assets/images/branding/aws_user_group_west_palm_beach_logo.png)
```

Example from a lab README inside `labs/lab-01-aws-cli-basics/`:

```md
![CLI output example](../../assets/images/labs/lab-01-cli-output-example.png)
```
