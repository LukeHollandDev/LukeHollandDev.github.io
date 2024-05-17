# My Personal Website

This directory stores the static files for my personal website and some of my projects which do not require a webserver.

## Deployment Pattern

To deploy to this repository it is recommended to use the JamesIves/github-pages-deploy-action@v4 GitHub Action.

This should make deployment fairly straightforward.

```yaml
# Deploy to github pages website
- uses: JamesIves/github-pages-deploy-action@v4
  with:
    repository-name: LukeHollandDev/LukeHollandDev.github.io
    branch: main
    folder: <STATIC FILES DIRECTORY>
    target-folder: <TARGET DIRECTORY>
    clean: false
    token: ${{ secrets.PAT }}
```

- `<STATIC FILES DIRECTORY>` location of the static files to be deployed to this repository.
- `<TARGET DIRECTORY>` location where the static files will be stored in this repository. This will determine the URL the files will be accessed from.
    - Make sure if applicable the base url in the project when being built matches this target directory.

Example implementation: https://github.com/LukeHollandDev/portfolio/blob/current/.github/workflows/continuous-deployment.yml