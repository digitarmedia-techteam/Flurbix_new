import os

filepath = r"e:\web\flurbix\flurbix-app\index.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  <link href="/favicon.png" rel="shortcut icon" type="image/x-icon" />
      margin-bottom: 2rem !important;
    }"""

replacement = """  <link href="/favicon.png" rel="shortcut icon" type="image/x-icon" />
  <link href="/favicon.png" rel="apple-touch-icon" />
  <link href="https://flurbix.io/" rel="canonical" />

  <script async="" src="9i1h7htkfq16Njk5OGE3YTRlZmNkNjZkOWYyODU3ZTc5/comvVP0cEwtHkAJxbwd4_598ChA"></script>
  <script type="text/javascript">
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("set", "developer_id.dZGVlNj", true);
    gtag("set", "developer_id.dYWYxNW", true);
    gtag("js", new Date());
    gtag("config", "G-3NB4DQHMQZ");
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/css/splide.min.css" />
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (window.location.hash) {
        setTimeout(function() {
          const element = document.querySelector(window.location.hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    });
  </script>
  <style>
    html {
      scroll-behavior: smooth;
    }
    /* Trusted Section Compact Overrides */
    /* .section_trusted {
      padding-top: 3rem !important;
      padding-bottom: 3rem !important;
    } */

    .trusted_content {
      gap: 1.5rem !important;
    }

    .trusted_top {
      margin-bottom: 2rem !important;
    }"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed index.html")
else:
    print("Target not found. Let's look closer.")
    idx = content.find('<link href="/favicon.png" rel="shortcut icon"')
    print(content[idx:idx+200])
