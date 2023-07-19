# Blog API

## Project Overview

Inspired by the intriguing complexities of access control addressed in UC Berkeley's CS 161 Security Project, this personal project explores the development of a blog API. The project's primary focus is the intricate management of users and the customization of their unique access rights.

The motivation for undertaking this project was twofold: firstly, to deepen my understanding of backend development, and secondly, to attain practical experience handling HTTP requests with Node.js, Express, and database technologies. Through this project, I aim to navigate the complexities of backend development and apply learned concepts to create a nuanced and functional system.

## Specification

1. User Management: Developed a RESTful API endpoint to facilitate user account creation, password updates, and account deletion. Implement appropriate error handling for scenarios such as attempted duplication of usernames during account creation, or incorrect old passwords during password updates.
    
2. Blog Post Management: Implement API endpoints supporting CRUD (create, read, update, delete) operations for blog posts. Users should be able to create a new post, retrieve existing posts, update the title and content of their own posts, and delete their own posts.
    
3. Commenting Functionality: Develop API endpoints to allow users to create, retrieve, update, or delete comments on blog posts. Users should be able to reply to existing comments. The deletion of a comment should not result in the deletion of its child replies. Implement appropriate permissions so that only the owner of a comment can modify or delete it.
    
4. Account Deletion Impact: Upon user account deletion, formulate a mechanism to remove all blog posts authored by that user, except those that have comments from other users.
    
5. Collaborative Post Editing: Implement functionality to enable the host (original author) of a blog post to invite other users to co-edit the post. Invited users should have the capability to update the post content but not delete the post. Invited users should not have the ability to invite additional collaborators. The list of current collaborators should be accessible to all collaborators and the host. The host should have the sole power to revoke editing privileges from any collaborator.


6. Search Functionality: Introduce API endpoints to enable a comprehensive search of blog posts. Users should be able to search by the following parameters:
    - Date Created: Enable chronological filter functionality to allow users to find posts based on their creation date. This feature should support both ascending and descending order searches.
    - Owner: Implement a search functionality that allows users to retrieve all blog posts authored by a specific user.
    - Blog Title: Develop a search mechanism that can match user search queries with the title of blog posts. The search should be case-insensitive and ideally support partial matches.
    - Blog Content: Similar to the title search, allow users to search the content of blog posts. This feature should support a free text search, retrieving any posts where the content matches the search terms.
    - Relevance Sorting: Ensure that search results returned by the title, content, and owner search functionalities are sorted based on relevance to the search query.


## Design

### Database
Since the data in this data base are to be interrelated by nature, I have decided to use a relational DB. Among the RDBMS that are available, I have decided to use PostgreSQL for the following reasons:


1. Multiversion Concurrency Control (MVCC): Given the nature of a blogging platform where concurrent user interactions such as comment modifications and post edits are commonplace, it's crucial to have a system that can handle concurrent transactions effectively. PostgreSQL's implementation of MVCC ensures that the database maintains consistency while handling simultaneous transactions, providing a significant advantage for this project.
    
2. Relational Integrity and ACID Compliance: PostgreSQL's robust support for enforcing relational integrity rules and ACID (Atomicity, Consistency, Isolation, Durability) properties ensures that the data remains consistent and reliable even in the face of system failures and concurrent user requests. This is critical for a blog platform that requires dependable user and content management. 
    
3. Advanced Indexing and Full-Text Search Capabilities: To implement a feature-rich search functionality, the RDBMS needs to support advanced indexing and full-text search capabilities. PostgreSQL offers a variety of indexing methods, including B-Tree, Hash, GiST, and GIN, as well as robust full-text search capabilities which will facilitate efficient searching and sorting of blog posts by various parameters.
    
4. JSON Support: While the core data of the blog API is relational, there may be instances where JSON-like storage could be beneficial (for example, storing certain aspects of a blog post). PostgreSQL's comprehensive JSON functions enable the storing, querying, and processing of JSON data, providing flexibility and ease of use.
    
5. Extensibility: PostgreSQL is highly extensible and allows for custom functions. This feature can provide the flexibility needed to handle any unique requirements or changes that may arise during the development of the blog API.



## Reflection

### Final spec → What got implemented?

1. User authentication
    In User authentication, I’ve implemented RESTful API endpoint routed to ‘/auth’  that manages creating, removing, loggin in, and changing password of a user account. Every user got an admin status based on the http body (JSON format) that the user supplied, and I’ve used jwt (JSON web token) to authenticate each user upon registering or logging in. To make sure that users cannot log in with old authentication tokens after changing the password, I’ve designed a mechanism where the time when a valid jwt token got issued gets recorded into the server’s database for each user. Once the user changes the password, then the timestamp gets updated so that any user token that was issued before changing the password could not go through my authenticator middleware. Also, the jwt tokens were issued with 1 hour expiration time to emulate sessions (though sessions with states can be debated to not fit in a RESTful API scheme) There is a complex user removal process that will be outlined in the comment management section.


2. Blog post management
    In post management, CRUD features were implemented. C, R, and D requests can be done by anyone with the authentication token issued by the post’s owner and any user with the admin status. Title, contents, updated time and creation times were stored in the server in addition to user information to link the posts with the users. Only individuals with the valid authentication tokens can perform blog operations (so they need to be logged in). 


3. Comment management
    In Comment management, I’ve also implemented the CRUD features. The posts can be CRD by the admin, the owner of the blog that the comment belongs to, and the user who wrote the comment. The comment can be updated by the owner of the comment and the admin. Any comment can have any number of replies to them, including the deleted ones. In other words, deletion of a comment does not affect the comment history/tree. 


    Another key feature is that the person who makes a comment can make the comment either private or public. Private comments can only be seen by the person who commented, the post owner, and the admin user. 


    When a user account gets removed, the following happens to the blog posts and comments written by the user. The blog posts gets removed IFF it has no comments written by someone other than the user. The comments gets removed in that its owner becomes a “deleted user” dummy user. Both the blog posts and comments get soft removed, but the user gets removed completely from the database. 


4. Collaborative editing
    I’ve implemented a feature where users can send invites to other users. The invited users can edit the post content and title, but they cannot invite other users or revoke access of other users. Users with the edit right can all synchronously edit the post (as in the update/put requests gets handled so that the response always matches the request). If the owner of the post deletes his/her account, then the collaborators have no right to alter the post anymore. 


5. Search feature
    I’ve implemented an endpoint for the client to send in search requests with most relevance. Using the PostgreSQL’s GIN indexing, I’ve implemented a full-text search on both the title and the content, and filter-by-date features. I’ve enabled requests to specify how many results to display that satisfy the query sent by the client. 


6. Testing
    I think I wrote a reasonable amount of tests to test out all the features mentioned above. However, One thing I wish I did was to implement performance test. Although there is a test that generates about 500? posts all at once to test the search functionality, I wish I did more in-depth performance tests. If not for docker and javascript date objects, I might have done that…

### What I learned
I’ve learned quite a lot from this project, but I think the most valuable assets are learning how to structure my program (like routes, models, configurations, etc.), the ability to write asynchronous programs (async/await and promises), learning more about SQL Database, and writing tests with Mocha and Chai. Another thing that I learned was the basic structure of http requests and how express handles request, response objects and how middlewares can be implemented. Furthermore, I think I learned a lot about thinking about security.

However, one thing that I really wish I could learn more was SQL database. I feel like I didn’t make the most of it in this project. Though using btree and GIN indexing were fun, I think I could have optimized many parts of my code if I just knew more about different key relations and functions Postgres offers.

Another thing I wish I could do were to actually deploy my api on a server hosted in AWS and/or make a CI/CD pipeline. I got my program to build, but I failed to setup a valid database to run my tests on. I could migrate my database, writing EVERYTHING in my database I guess, but that would do nothing since my inability to replicate tests in containerized setting means that if this thing got deployed, it would not have any database associated to it (I think). 