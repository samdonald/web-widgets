# web-widgets
Web widgets can be used to demonstrate programming to new and experienced developers or as a library of small components, which can be readily added to any website/app and customised for purpose. Everyone is welcome to contribute a widget.

- [:link: &nbsp; Web Widgets](https://mudlabs.github.io/web-widgets)


## Contribute
Create your widget html file and add it to the `widgets` directory. Please refernce the blow example for how to stucture you widget, or open the `widgets` directory and view an existing widget.

**Example**
- The `name` attribute is required. This will be the name of your widget in the widgets list.
- The `summary` attribute is required. This brief summary should help give people an idea of what your widget is/does.
```html

  <!-- Put you all you widget html here -->
  <h1 class="title">Hello World</h1>


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
  <tbody id="contributors">
    <tr><td id="mudlabs" align="center">
  <a href="https://github.com/mudlabs">
    <img src="https://avatars.githubusercontent.com/u/32623552?v=4" width="100px;" alt="avatar"><br>
    <sub><b>mudlabs</b></sub>
  </a>
</td>
</tr>
  </tbody>
</table>


</body></html>
