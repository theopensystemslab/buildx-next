# README

## Getting Started

### 1. Create Airtable Base(s)

You'll need to sign up to Airtable if you haven't already (and also **generate an API key in your account settings**, for later).

Here are some pre-existing Airtable bases that will work with Build X. It's recommended to copy one of these to begin with.

| Build System    | Shared Airtable Base URL               |
| --------------- | -------------------------------------- |
| WikiHouse Swift | https://airtable.com/shrfLb5VdqrzkrR05 |
| HOLZ100         | https://airtable.com/shrIAYEoae51NWQCu |

Press the `Copy base` button in the top right to copy one into your own workspace. This is necessary, your API key won't work with shared bases. The base ID (which we'll need for our configuration later) needs to be in the format described [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs).

Any new Airtable base can be created and plugged into Build X so long as the schema remains the same and the necessary records are entered.

### 2. Fork Build X

Press either `Use this template` (no-code users) or `Fork` (developers/contributors) on this repository.

### 3. Edit the Configuraton

The configuration file is `buildx.config.yaml`. You can use the GitHub UI to edit this file by clicking on the file to open it, and then clicking the **pencil icon** in the top right to _Edit this file_. The `id` and `name` fields can be anything so long as the `id`'s are unique. The `airtableId` is the Airtable Base ID as described [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs).

Commit your changes when finished editing (the button at the bottom).

### 4. Deployment

The easiest way to deploy this project is with a serverless provider such as [Vercel](https://vercel.com) or [Netlify](https://netlify.com). You can sign up for an account with either provider using your GitHub account, and then create a deployment pointing to your GitHub repository (the same one that you just edited the configuration file in).

#### Environment Variables

There'll be a section to enter environment variables, there are two that need to be defined:

| Key                               | Value                 |
| --------------------------------- | --------------------- |
| `NEXT_PUBLIC_AIRTABLE_API_KEY`    | Your Airtable API key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token   |

Please go to https://account.mapbox.com/auth/signup/ to get a Mapbox account if necessary. You should be able to get an access token from https://account.mapbox.com/.

### 5. Embed as an Iframe

Once you've deployed your project, you'll be given a URL which you can embed in your website with [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) element.
