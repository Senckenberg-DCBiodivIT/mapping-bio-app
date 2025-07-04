# Mapping.bio App
This repository contains the code to run the [mapping.bio](https://mapping.bio) tool. It is both an interactive editor for mapping terms between two ontologies, as well as the frontend to a repository for storing mappings as FAIR digital objects, aligned with the standards SSSOM, and "webby" FDOs based on RO-Crate and Signposting.

This App was created during the [BioDT](https://biodt.eu/) project.

## Setup
The frontend application is based on Vue.js and can be run with

```
npm install
npm run serve
```

## Backend deployment
To run the app with a backend (required for storing the mappings) the app expects a [Keycloak](https://www.keycloak.org/) instance for authentication and an instance of the [CORDRA](https://www.cordra.org/) software for managing digital objects.

There is a separate README in the folder `backend` which explains the local backennd setup.
