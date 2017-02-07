# Customize your instance

## With attributes

Each directive has each own attributes that change the behaviour of the search,
in this section we will see the most important attributes for each directive.

In general, all directives but `invenio-search` have the attribute `template` in
which you specify the URL of the template you'd like to use.

Example:

```
<invenio-search-results
  template="http://domain.com/templates/results.html"
></invenio-search-results>
```

### invenio-search

##### search-endpoint
The URL for the REST API

Example: `http://domain.com/api/records`

##### search-headers
The Headers to be sent on each request

Example:

```
{
  "Content-Type": "application/json"
}
```

##### search-extra-params
Enhance the user query with extra parameters

Example:

```
{
  "collection": "heroes"
}
```

This will add to each API request the parameter `?collection=heroes`

##### search-hidden-params
Enhance the user query with extra parameters without updating the URL (`window.location`)

By default the `invenio-search` updates the browser's location with the requested parameters, there is a way to enhance
the query without the parameters been visible with this attribute.

```
{
  "collection": "restricted"
}
```

### invenio-search-bar

##### placeholder
This attribute can be used in the template, usually for the input's placeholder attribute.

Example:

The directive initialization
```
<invenio-search-bar
  template="searchBar.html"
  placeholder="Type something"
></invenio-search-bar>
```

In the template `searchBar.html`
```
<input placeholder="{{ placeholder }}" />
```

### invenio-search-error

##### error-message
This attribute can be used in the template, usually for displaying a message when there is an error.

Example:
The directive initialization
```
<invenio-search-error
  template="error.html" error-message="Error message"
></invenio-search-error>
```

In the template `error.html`
```
<p>ERROR: {{ errorMessage }}</p>
```

### invenio-search-loading

##### loading-message
This attribute can be used in the template, usually for displaying a message when a request is ongoing.

Example:
The directive initialization
```
<invenio-search-loading
  template="loading.html"
  loading-message="Loading"
></invenio-search-loading>
```

In the template `loading.html`
```
<p>Loading: {{ loadingMessage }}!</p>
```

### invenio-search-pagination

##### show-go-to-first-last
This attribute is whether or not to display the first and last button on the pagination.

##### adjacent-size
This attribute is how many pages to display if there are more than 10.

Example:
The directive initialization
```
<invenio-search-pagination
  template="pagination.html"
  show-go-to-first-last="true"
  adjacent-size="4"
></invenio-search-pagination>
```

### invenio-search-sort-order

##### sort-key
Select which key to use for sorting.

Example:
The directive initialization
```
<invenio-search-sort-order
  template="sort.html"
  sort-key="city"
></invenio-search-sort-order>
```
