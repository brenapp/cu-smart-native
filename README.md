# cu-smart

The source for CU Smart, an app created by Clemson University Facilities designed to improve the
University's energy efficiency. Includes both the client side (react native) and server side
(nodejs). This repository contains code for the frontend and backend, both written in TypeScript.
This repository uses [lerna](https://lerna.js.org) to manage each package.

## Project Structure

CU Smart has 2 main software packages: a frontend native app built using React Native, and a backend
built using Nodejs.

- [frontend](https://github.com/MayorMonty/cu-smart/tree/main/frontend)
- [backend](https://github.com/MayorMonty/cu-smart/tree/main/backend)



## Setup

1. First make sure you have all of developer tools installed:

   - [Node](https://nodejs.org), for the backend server, and is required for tooling. If you are on
     windows, be sure to enable the selection for node-gyp tooling, which will install additional
     components to work with native modules easier. This will be important for working with `sqlite3`
   - [Expo](https://expo.dev), the runtime environment to make working with React Native easier,
     including device previews
   - [lerna](https://lerna.js.org), which is used to manage the monorepo
   - [Clemson VPN](https://cuvpn.clemson.edu), if you are not campus, to be able to access on-campus
     resources.

2. Next, clone the repository

```
git clone git@github.com:MayorMonty/cu-smart.git
```

3. Next, install all dependencies using lerna. This will take a minute or so.

```
lerna bootstrap
```

4. Create your local backend database. This is a simple SQLite database file, in the project root of
   the backend server, at the same level of the `package.json` file. No further setup is required,
   as the backend server will automatically ensure it has all of the tables it uses.

```
cd packages/backend
touch cu-smart.db
```

5. Get the `config.json` file from the deployment server or another team member. This server
   contains configuration for the backend, including credentials, etc.
   **This file should not be published to github!**

6. Run the dev script. This will launch the development server, and start Expo.

```
./scripts/dev.sh
```

Any options you pass to the dev script will be passed to Expo. So, if you had an Android device
connected over USB debugging, and wanted to use it for development, you can run:
```
./scripts/dev.sh --localhost --android
```

> Pro Tip: You will likely be running these dev scripts a lot, so it may be beneficial to add a
> function to your `.bash_profile` to make it faster to type. 
> ```
> @() {
>    ./scripts/$1.sh ${@:2}
> }
> ```
> This allows you to run shell scripts using the @ symbol, like so
> ```
> @ dev --localhost --android
> ```

## Workflow

We generally follow [GitHub Flow](https://guides.github.com/introduction/flow/), which means that
code on `main` should be always be deployable. When you are creating a new feature or fixing an
issue, you should follow the steps below:

1. Create or use an issue to describe the changes you are going to make. 
   
2. Create a new branch. The name isn't super important, but one standard to follow is
   `feat/new-feature` or `fix/bug-fix`

3. Make your changes. Be sure to commit early and often! Each commit should be relatively atomic and
 have a descriptive message. This means that reversing your changes will be easier.

3. Create a pull request. This will allow other developers to review your code, to merge back to `main`

4. Close the issue you opened in #1.  

*Note: this is the process for new features or bug fixes. If you are correcting a typo, it's generally OK to commit directly to main.*

## Contributors

- Brendan McGuire <bmmcgui@clemson.edu>
- Yongjian Zhao <yongjia@clemson.edu>
- Kartik Rao <krao@clemson.edu>
- Da Li <dli3@clemson.edu>
- Snowil Lopes <slopes@clemson.edu>
