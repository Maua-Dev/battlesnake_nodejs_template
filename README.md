# battlesnake_nodejs_template 🐍

This is a [Battlesnake](http://play.battlesnake.com) template written in Typescript using the [ExpressJs](https://expressjs.com/en/5x/api.html).

## Introduction and Objectives ⁉
The main purpose of this project is to create a template for Battlesnake using Typescript NodeJS. The biggest challenge is to understand how an API works and how to deploy it in AWS Lambda.

![Example](https://github.com/Maua-Dev/battlesnake_fastapi_template/assets/81604963/58080c12-6d91-4366-b4e0-f7cd9f20f98d)

## How to use 🤔
First of all, you need to create a repo using issues from [Devmaua setup](https://github.com/Maua-Dev/devmaua_setup/), set the **project_name** as "**battlesnake_nodejs_{your name}**" and project template as **battlesnake_nodejs_template** and make sure it's **public** . Hit create issue and wait for the setup to finish.

After that you need to clone your new repo, you need to install the dependecies with **NPM** or **YARN**. Just choose **ONE** of them, to avoid future problems!

## Installation 👩‍💻

###### create FILE .env:
    STAGE = TEST


#### Install the dependencies
    npm install
    or
    yarn


#### Run the server locally (needs .env -> STAGE = TEST)

    npm run start
    or
    yarn start

## The Challenge 🐍
The challenge is to create a Battlesnake using NodeJs and ExpressJS. The Battlesnake must be deployed in AWS Lambda.
You can find the documentation for Battlesnake [here](https://docs.battlesnake.com/).

### The files 📁
The project have one folder: **src**.
In src, you can find the index.ts file, which is the file that contains the ExpressJS app and the routes. From there, you can create your own routes and functions.

### The routes 🛣
The routes are created in the **index.ts** file. You can create your own routes and functions. The routes are created using Express with Typescript, you can find the documentation [here]((https://expressjs.com/en/5x/api.html)). Follow the rules from the Battlesnake documentation to create your routes, they should look like [this](https://docs.battlesnake.com/api).

### Attention 🚨
In order to deploy your Battlesnake in AWS Lambda, you need to follow some rules:
- The routes must be created using express;
- ALWAYS test your code before pushing it to the repo. You can use pytest to test your code;
- Every file should be inside the src folder;

### Deploy 🚀

After pushing your code to the repo, it will trigger an action to deploy your code in AWS Lambda. You can find the action in the **.github/workflows/CD.yml** file.

The first time you push your code, the action will create a new stack in AWS CloudFormation. After that, every time you push your code, the action will update the stack with the new code.

In the [Actions](https://github.com/Maua-Dev/battlesnake_nodejs_template/actions) tab, you can see the status of the deploy and if it was successful or not. If it was successful, you can find the URL of your API in the outputs tab of the action (in the final part of the "Deploy with CDK" step).

![Action Tab](https://i.imgur.com/VSOPMLw.png)
![STEP](https://github.com/Maua-Dev/battlesnake_fastapi_template/assets/81604963/6129f465-a54d-46fc-b45a-c8b219a6823b)

There you can find your API URL. You can use this URL to create your Battlesnake in the Battlesnake website. You can find the documentation [here](https://docs.battlesnake.com/guides/getting-started#step-2-create-a-battlesnake).

The same outputs include a **CloudWatchLogs** link to the Lambda log group (`console.log` and errors show up there) and a **LambdaConsole** link to the function itself. You need to be signed in to the Dev AWS account to open them.

![Outputs](https://github.com/Maua-Dev/battlesnake_fastapi_template/assets/81604963/e06bf1dd-18cc-4057-91ea-3ccd8074848f)
![Cloudwatch Logs](https://github.com/Maua-Dev/battlesnake_fastapi_template/assets/81604963/94483cd1-ae3c-46c0-86df-d8fff0b0490e)

After finishing your project, you can delete it from our backend using our CD.

![AwsDestroy](https://i.imgur.com/jDTFeZJ.png)

## Useful tools 🛠

- [Postman](https://www.postman.com/) - API development environment
- [ExpressJs](https://expressjs.com/en/5x/api.html) - API micro-framework Node.js
- [NodeJs](https://nodejs.org/en/download/package-manager) - Node Documentation
- [Battlesnake](https://docs.battlesnake.com/) - Battlesnake Documentation

## Thanks 👢🍿

We hope you like and enjoy it! Thanks!

## Contributors 💰🤝💰

This project was developed to use inside the Dev. Community Mauá, but feel free to help!.

- Luca Pinheiro - [LucaPinheiro](https://github.com/LucaPinheiro) 🚀
- Rodrigo Siqueira - [Rodrigosiq03](https://github.com/Rodrigosiq03) 🧙‍♂️


## Contact us 📞
If you have any questions, feel free to contact us! You can find us in our [Discord](https://discord.gg/Yr2VPgAmcb) server.
