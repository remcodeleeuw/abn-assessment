# Assignment
Our simple cocktail app has a DB of cocktail recipies with a backend and front end to retrieve and show the cocktails. There are currently two views, a list cocktails view and add new cocktail view. In general we don't really care about styling, so keep it simple and no need to add fancy UI features. What we would like to see, is to add the following features:
* From the list page we want to navigate to a new view to see details on any selected cocktail. (We do not care about styling for this new view)
* Complete the "Search by description" functionality on the list page by adding a filter on the cocktail list based on description.
* On the new cocktail page, add feedback in case of API error. for example try to add a second 'Nojito', see how cocktail name has to be unique

# Submitting requirements
The project is expected to be delivered as a GitHub (or any other public git
hosting) repository URL. Please **DO NOT fork** this project.

# Bonus
Feel free to add these two additional features for bonus points, anything else added will not be reviewed.
* Fuzzy Search on description and title using ElasticSearch (service is already installed)
* OpenAPI documentation of APIs

# Provided boilerplate
https://github.com/eduard-wu/fullstack-nodejs-assessment
* Basic Vue3 front end with all required pages and views
* Basic NestJS Backend for existing page and connection to DB
* ElasticSearch is setup
* Basic list of recipes are present in database
