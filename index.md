* Download for my project proposal poster - [DOWNLOAD][1]
* Download for my internship presentation slides - [DOWNLOAD][2]

[1]:{{ site.url }}/assets/files/Poster.pdf
[2]:{{ site.url }}/assets/files/Presentation.pdf


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
