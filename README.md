https://mudlabs.github.io/web-widgets

# web-widgets
Small web widgets can be used to demonstrate programming to new and experienced developers. Everyone is welcome to contribute a widget.


## Contribute
Create your widget html file and add it to the `widgets` directory. Please refernce the blow example for how to stucture you widget, or open the `widgets` directory and view an existing widget.

**Example**
- The `name` attribute is required. This will be the name of your widget in the widgets list.
- The `summary` attribute is required. This brief summary should help give people an idea of what your widget is/does.
```html
<body data-widget-name="Foo Bar" data-widget-summary="This widget example shows you how to structure a widget.">
  <!-- Put you all you widget html here -->
  <h1 class="title">Hello World</h1>
</body>

<style>
  .title {
    color: red;
  }
</style>

<script>
  setTimeout(() => {
    const title = document.querySelector(".title");
    title.style.color = "blue";
  }, 2000);
</script>
```


## Widget Contributors

<table>
  <tr></tr>
</table>
