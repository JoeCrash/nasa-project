NASA Project

Create fictional launches using this NASA Mission Control system. Abort planned launches. View historical and upcoming SpaceX launches using the SpaceXAPI.com API


Tech Info:
MERN Stack (Mongo, Express, React, Node.js)

Front End Development in React
Backend Development in Node.js
API development with Express and Postman
Data Storage using Mongo Atlas
CI/CD pipeline with Github Actions
Logging with Morgan middleware

Might need to add the node_modules path
ENV PATH /app/node_modules/.bin:$PATH

Create & Run
docker build . -t joecrash/nasa-project
docker run -it -p 8000:8000 joecrash/nasa-project

Get List of containers
docker ps

Inspect in shell
docker exec -it <img-id> sh

Deploy to ec2
create an instance
setup keypair
setup security group
ssh into system
`ssh -i "keypairs/nasa-project-key-pair.pem" ec2-user@<my-ec2-ip>`
`sudo yum update -y`
`sudo yum install docker`
`sudo service docker start`

Update the ec2 user access for docker
`sudo usermod -a -G docker ec2-user`

Run in ec2
docker run --restart=always -p 8000:8000 joecrash/nasa-project
