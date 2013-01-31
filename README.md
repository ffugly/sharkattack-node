# Shark Attack Nodejs
---

## Installing
To begin be sure that nodejs and npm are installed. Shark Attack also runs off of Redis and MySQL, be sure those are running and installed. You will need these to install all packages that come with Shark Attack chat app. Follow the commands below to get started:

	brew install mysql
	brew install redis
	brew install nodejs
	brew install npm
	
In a seperate terminal window, be sure that you have started MySQL and Redis server is running. The next command will attempt to migrate your database. Be sure to check the database.json file for the correct authentication parameters to successfully connect to MySQL. 
	
	git clone git@github.com:amanelis/sharkattack-node.git && cd sharkattack-node/
	npm install -g 	
	db-migrate up
	
If everything has successfully worked. Go ahead and boot up the application by typing the following command:	

	node app.js
	open http://localhost:3000
	
Thats it! You should be ready to roll.

