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




## Contributing
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

6. Run the dev script. This will launch the development server, and start Expo. Any options you pass
   to this script will be passed
```
./scripts/dev.sh
```

## Contributors

- Brendan McGuire <bmmcgui@clemson.edu>
- Yongjian Zhao <yongjia@clemson.edu>
- Kartik Rao <krao@clemson.edu>
- Da Li <dli3@clemson.edu>
- Snowil Lopes <slopes@clemson.edu>
