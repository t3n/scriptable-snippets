const widget = await createWidget();

if (!config.runsInWidget) {
  widget.presentSmall();
}

Script.setWidget(widget);
Script.complete();

async function fetchData() {
  let req = new Request("https://api.t3n.de");
  req.method = "POST";
  req.headers = {
    "Content-Type": "application/json",
  };
  req.body = JSON.stringify({
    operationName: "ScriptableLatestNews",
    variables: {},
    query:
      "query ScriptableLatestNews {\n  article {\n    recentNews(limit: 4) {\n      identifier\n      title\n      url\n      imageUrl(width: 500, height: 500)\n    }\n  }\n}\n",
  });
  const { data } = await req.loadJSON();
  const news = data.article.recentNews;

  return news;
}

async function loadImage(url) {
  const req = new Request(url);
  const img = await req.loadImage();

  return img;
}

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#f9423a");

  try {
    const logoImage = await loadImage(
      "https://d1quwwdmdfumn6.cloudfront.net/t3n/2018/images/logos/t3n_logo_420x420.png"
    );
    const logoSize = config.widgetFamily === "large" ? 60 : 40;
    const logo = widget.addImage(logoImage);
    logo.imageSize = new Size(logoSize, logoSize);

    const data = await fetchData();
    const images = await Promise.all(
      data.map((item) => loadImage(item.imageUrl))
    );

    data
      .slice(0, config.widgetFamily === "large" ? undefined : 1)
      .map(async (item, i) => {
        widget.addSpacer();

        const { title, url } = item;

        if (i === 0) {
          const image = images[i];
          widget.backgroundImage = image;

          const gradient = new LinearGradient();
          gradient.locations = [0, 1];
          gradient.colors = [
            new Color("#f9423a", 0.8),
            new Color("#f9423a", 1),
          ];
          widget.backgroundGradient = gradient;

          if (config.widgetFamily !== "large") widget.url = url;
        }

        const itemText = widget.addText(title);

        itemText.font = Font.boldSystemFont(
          config.widgetFamily !== "small" && i === 0 ? 18 : 14
        );
        itemText.textColor = Color.white();

        if (config.widgetFamily === "large") itemText.url = url;
      });

    if (config.widgetFamily === "large") widget.url = "https://t3n.de";

    widget.addSpacer();

    return widget;
  } catch (err) {
    widget.addSpacer();

    const errorText = widget.addText(
      "Leider gab es ein Problem beim Darstellen des Widgets"
    );
    errorText.font = Font.boldSystemFont(14);
    errorText.textColor = Color.white();

    widget.addSpacer();
    return widget;
  }
}
