Below are downloads for my proposal poster and the slides from my presentation.
* Download for my project proposal poster - [DOWNLOAD][1]
* Download for my internship presentation slides - [DOWNLOAD][2]

[1]:{{ site.url }}/assets/files/Poster.pdf
[2]:{{ site.url }}/assets/files/Presentation.pdf

# My internship at Barclays

### Who are Barclays?
Barclays is a multinational universal bank, headquartered in London. Barclays is responsible for many innovations in the banking industry such as contactless payments and even creating the world’s first ATM. With the increasing popularity of digital banking and the usefulness of different technologies in the banking industry, Barclays have been hiring more and more in the technology industry. With the opening of their new campus in Glasgow, they expect to double their number of workers, having around 5,000 workers within 2 years at the new campus.

### About my internship at Barclays
The summer placement taken place over 8 weeks and was entirely work from home. During the internship there was quite a lot going on. We had many training sessions which taught us about Barclays and the finance industry in general. Also having the opportunity to network with other interns in several networking events – where we would team with random interns and have a quiz. As for the actual work, I was put into a team with 3 other interns.

We worked in Wealth Processing within the Equity Trading Platform team. Their team handles the backend technologies which make up the UK equity dealing platform for Smart Investor – a Barclay’s retail trading platform.

### Some information on the project I worked on
The project I worked on with my fellow interns was to develop a solution which would keep track of the latencies between several different services that the Equity Trading Platform team run. This would help the team identify where issues are occurring, like what service is causing any extended delays. This is important as it’s a trading platform which needs to be fast and reliable.

The tool stores and calculates the latencies in real time and will alert the team whenever a latency is higher than it’s expected – the alert will show the latency that triggered it along with all the identifying information required to investigate it further.

### Team management during the internship
During the project we worked in an Agile workflow, with weekly sprints. We had daily stand- ups where we would review all the tickets everyone is working on and the tickets that had been completed since the last standup. Then at the end of each sprint we had an RRP (review, retrospective, and planning) where we would review the sprint, reflect on it to see how we can improve and then plan for the next sprint – looking back over the backlog and revisiting the requirements.

For our project, we had a lot more of a hands-on approach than some other teams might have had, as we got to make all the decisions from the planning to the design/architecture. And even each of us in the team would take a turn being the scrum master each sprint, giving us more experience with the whole software process. Our manager thought this would be very valuable to give us more experience, and I couldn’t agree more. This additional management experience was very valuable, and I learned a lot from it.

To manage the project, we used several Atlassian services; Jira, Bitbucket and Confluence. Jira was used to organise all the tasks we had each sprint and split them up between the 4 of us, it also helped keep track of our progress. To document our project we used Confluence, it allowed us to easily collaborate on the documents and keep them all stored in one place. Finally, we used Bitbucket to manage the code of the project. This is very similar GitHub and Gitlab. As it is another Atlassian product it worked very well with Jira allowing us to make branches directly from our tickets in Jira as well as tracking process related to the ticket.

### Technologies used during the project
The project uses many AWS services, and for all the logic it uses Python. The project is made up of several AWS services which are linked together calculate the latencies. Our AWS stack would start from a simple CloudWatch filter which would read log messages all the way to DynamoDB where an AWS Lambda would populate it with the Latency calculations.

The AWS services we used:
* CloudWatch – logging service for AWS services
* Lambda – serverless computing which runs code only when needed
* DynamoDB – fully managed document database
* Simple Queue Service – message queue service
* CloudFormation – deployment of the AWS stack

### PSD and the team projects' relevance
Both professional software development and the team project I felt were quite useful for my internship. The experience I gained during my team project helped me prepare for the internship as the experience of working on a project was very similar – especially with the idea of stand-ups, sprints and tickets and the overall workflow of working on a project with other developers. Then professional software development, quite a few of the ideas taught during the course I found during my internship such as the agile methodology, retrospectives, code reviews, feature branching to name a few.

# My project proposal for AWS CloudFormation tool

### What is CloudFormation
CloudFormation is an AWS service which allows developers to provision and configure AWS infrastructure, which can be made up of many of the services AWS offers and even some third-party ones. It works by creating a template for the product which describes all the resources and how they connect with each other. CloudFormation then takes this template and handles the provisioning and configuration for you.

### Problem statement/why the tool might be required
CloudFormation handles a lot of the work for the developer, such as deployment and configuration of the individual components in an AWS product. However, there are a few issues due to the nature of developing a new infrastructure such as some configuration options which require being dynamic and need changed/calibrated during testing. Also, if you update the template to add new resources it isn’t always practical to tear down the existing infrastructure and re-build all – this leads to any additional resources to an existing stack needing to be manually provisioned by the developer using the AWS service catalogue.

When developing a large project there’s often many environments where the project is deployed such as development, testing, production etc. When the product template is updated, this might need to be reflected in all these environments such as introducing a new service into the product stack. Generally, the development stack would be updated first to get the new service to work with the rest of the stack. But once it has been implemented, you’ll likely want to move it to your testing environments which there could many, this would then mean for each environment you’ll have to use the service catalogue to deploy each of the services for every environment. This can become quite monotonous when you’re doing it quite often.

Another issue when developing a large project is many of the parameters will be updated during the development step and subsequentially the development stack will have many configured parameters which will need to be used in the next environments after development – testing/prod etc. The developer would need to manually promote these changes up the stack when moving onto the testing environment for instance.

### How the tool will work
This tool will be used to tackle the two issues highlighted in the problem statement: adding new resources to a template and promoting the state of one environment to another. It’ll be a simple script which will give the developer the ability to deploying new resources added to their templates without having to navigate through AWS and deploy them via the AWS service catalogue.

Then for when you’re done with testing on any environment you can easily promote its configuration to the next step whether it be more testing environments or even to production environment. For promoting stacks there will also be a built-in whitelist where you can specify any environment specific parameters which should not be promoted such as configurations for databases etc.

Additionally, when using the tool there will be a drift check which before updating any configuration or deploying new resources, you’ll receive a drift report to let you know how your deployed stack differs to the template.
