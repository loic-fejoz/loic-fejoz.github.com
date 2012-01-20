---
layout: page
title: Du bricolage, de l'ingénierie et un peu de zeste
---

Read [Jekyll Quick Start](http://jekyllbootstrap.com/jekyll-quick-start.html)

Complete usage and documentation available at: [Jekyll Bootstrap](http://jekyllbootstrap.com)

Here's a sample "posts list".

{% for post in site.posts limit:1%}
{{ post.content }}
{% endfor %}
<ul class="posts">
  {% for post in site.posts skip:1 %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

## To-Do

This theme is still unfinished. If you'd like to be added as a contributor, [please fork](http://github.com/plusjade/jekyll-bootstrap)!
We need to clean up the themes, make theme usage guides with theme-specific markup examples.


