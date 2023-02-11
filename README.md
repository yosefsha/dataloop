# **data-managment-interview**
### Description
 - Public repository with the data management team's technichal interview assignment inside  
 ---
 ## Assignment specification:

Raw Data - https://data.gov.il/dataset/israel-streets-synom/resource/1b14e41c-85b3-4c21-bdce-9fe48185ffca
---
## Provided dependencies:
 Provided is a docker-compose file which contains all of the dependencies that you will need to complete the assignment.\
 You do not need to lift all of the services, you can choose which you need as listed in the assignment specification.
 ### The docker-compose exposes the following services:
  - mongoDB
  	- No-sql database, Version - 4.2
	- exposed on localhost port  27017
	- Can be connected to with robo3t/ studio 3t with no need for authentication - https://robomongo.org/
  - Singlestore (formerly memsql)
  	- ANSI SQL compliant and MySQL wire protocol compatible SQL database
	- exposed on port 3306
	- UI studio is exposed on port 8012
		- Authentication:
			- Username: root
			- Password: Password1
 - RabbitMQ
	- backend exposed on port 5672
	- management UI exposed on port 15672
		- Authentication:
			- Username: guest
			- Password: guest
 - Redpanda
	- Fully Kafka-api compatible data streaming platform
	- Kafka broker exposed on port 9092
	- UI exposed on port 8014 with no need for authentication\

If you would like to a different service for a database/queueing system feel free to do so, as long as they adhere to the assignement specifications

