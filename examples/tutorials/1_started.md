<!--
    This file is part of Invenio.
    Copyright (C) 2017-2018 CERN.

    Invenio is free software; you can redistribute it and/or modify it
    under the terms of the MIT License; see LICENSE file for more details.
-->
# Basic usage

`Invenio-Search-Js` help you easily display results from the
Invenio REST API.

The angular module has been split in different directives
which each one is responsible for a specific action on the app.

## Initialize the app

```
<script src="path/to/angular.js"></script>
<script src="path/to/invenio-search-js.js"></script>
<script>
  // Bootstrap the angular app to the specific `div` with id `search`
  angular.element(document).ready(function() {
    angular.bootstrap(
      document.getElementById("search"), ['invenioSearch']
    );
  });
</script>
```


### Example only with only search results

We have the following API and we'd like to display the results with the
`invenio-search-js`.

```
$ curl /api/super/cities

{
  hits: {
    total: 2
  },
  data: [
    {
      "name": "Harley Quinn",
      "city": "Midway"
    },
    {
      "name": "Jessica Jones",
      "city": "New York"
    }
  ]
}
```

For this example we'll use the `<invenio-search-results>` directive for displaying the
results.

```
<div id="search">
  <invenio-search search-endpoint="/api/super/cities">
    <invenio-search-results template="results.html"></invenio-search-results>
  </invenio-search>
</div>
```

The `results.html` will look like this:

```
<ul>
  <li ng-repeat="hero in vm.invenioSearchResults.data track by $index">
    <h5>{{ hero.name }}</h5>
    <p>{{ hero.city }}</p>
  </li>
</ul>
```

**Note**: the `vm.invenioSearchResults` contains the response of the API hence we
use `vm.invenioSearchResults.data` to iterate the results.

### A more complex example

We have the following API and we'd like to display the results with the
`invenio-search-js` and include number of results, pagination and loading message.

```
$ curl /api/super/cities

{
  hits: {
    total: 6
  },
  data: [
    {
      "name": "Harley Quinn",
      "city": "Midway"
    },
    {
      "name": "Jessica Jones",
      "city": "New York"
    },
    {
      "name": "Luke Cage",
      "city": "New York"
    },
    {
      "name": "Batman",
      "city": "Gotham"
    },
    {
      "name": "Iron Man",
      "city": "New York"
    },
    {
      "name": "Flash",
      "city": "Central"
    }
  ]
}
```

```
<div id="search">
  <invenio-search search-endpoint="/api/super/cities">
    <!-- search bar -->
    <invenio-search-bar template="searchBar.html" placeholder="Start typing"></invenio-search-bar>
    <!-- number of results -->
    <invenio-search-count template="count.html"></invenio-search-count>
    <!-- loading message -->
    <invenio-search-loading template="loading.html" message="Loading"></invenio-search-loading>
    <!-- search results -->
    <invenio-search-results template="results.html"></invenio-search-results>
    <!-- search pagination -->
    <invenio-search-pagination template="pagination.html"></invenio-search-pagination>
  </invenio-search>
</div>
```

#### `searchBar.html`

```
<input placeholder="{{ placeholder }}" ng-model="vm.userQuery" />
```

**Note**: `ng-model="vm.userQuery"` is important for mapping the user input
to the application.

Also the request parameter for search will always be `q`. For example if user
types `Harley` the API request will be `GET /api/super/cities/?q=Harley`

#### `count.html`

```
<p>{{ vm.invenioSearchResults.hits.total }}</p>
```

**Note**: ``vm.invenioSearchResults.hits.total`` is returned by the server.


#### `loading.html`

```
<div ng-show="vm.invenioSearchLoading">{{ loadingMessage }}</div>
```

You have access to `vm.invenioSearchLoading` which indicates if there is any ongoing
request, you can use it in any template inside the app.


#### `results.html`

```
<ul>
  <li ng-repeat="hero in vm.invenioSearchResults.data track by $index">
    <h5>{{ hero.name }}</h5>
    <p>{{ hero.city }}</p>
  </li>
</ul>
```

**Note**: the `vm.invenioSearchResults` contains the response of the API hence we
use `vm.invenioSearchResults.data` to iterate the results.

#### `pagination.html`

```
<ul class="pagination" ng-if="vm.invenioSearchResults.hits.total">
  <li ng-show="showGoToFirstLast" ng-class="paginationHelper.getFirstClass()">
    <a href="#" ng-click="paginationHelper.changePage(1)" aria-label="First">
      <span aria-hidden="true"><<<span>
    </a>
  </li>
  <li ng-class="paginationHelper.getPrevClass()">
    <a href="#" ng-click="paginationHelper.changePage(paginationHelper.previous())" aria-label="Previous">
      <span aria-hidden="true"><</span>
    </a>
  </li>
  <li ng-class="paginationHelper.getPageClass(page.value)" ng-repeat="page in paginatePages">
    <a href="#" ng-click="paginationHelper.changePage(page.value)" alt="{{ page.title }}">{{ page.value }}</a>
  </li>
  <li ng-class="paginationHelper.getNextClass()">
    <a href="#" ng-click="paginationHelper.changePage(paginationHelper.next())" aria-label="Next">
      <span aria-hidden="true">></span>
    </a>
  </li>
  <li ng-show="showGoToFirstLast" ng-class="paginationHelper.getLastClass()">
    <a href="#" ng-click="paginationHelper.changePage(paginationHelper.total())" aria-label="Last">
      <span aria-hidden="true">>></span>
    </a>
  </li>
</ul>
```

The app provides for pagination helper functions.
