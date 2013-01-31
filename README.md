# Shark Attack Nodejs
---

## Installing
Lets get started by installined all dependencies.

The main dependencies for Shark Attack are MySQL, Redis, NPM and all packages that are under `package.json` be sure all of these binaries are installed and running.

	brew install mysql
	brew install redis
	brew install nodejs
	brew install npm
	
In a seperate terminal window, be sure that you have started MySQL and the Redis server is running. If you are un certain as to who to boot those services, here are the commands:

	mysql.server start
	redis-server

The next command will attempt to migrate your database. Be sure to check the database.json file for the correct authentication parameters to successfully connect to MySQL. 
	
	git clone git@github.com:amanelis/sharkattack-node.git && cd sharkattack-node/
	npm install -g 	
	db-migrate up
	
If everything has successfully worked. Go ahead and boot up the application by typing the following command:	

	node app.js
	open http://localhost:3000
	
Thats it! You should be ready to roll.

