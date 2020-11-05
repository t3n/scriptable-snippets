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
    operationName: null,
    variables: {},
    query:
      "{\n  article {\n    recentNews(limit: 1) {\n      identifier\n      title\n      url\n      imageUrl(width: 500, height: 500)\n    }\n  }\n}\n",
  });
  const { data } = await req.loadJSON();
  const news = data.article.recentNews[0];

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
    const data = await fetchData();
    const { title, imageUrl, url } = data;

    const image = await loadImage(imageUrl);
    widget.backgroundImage = image;

    const gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [new Color("#f9423a", 0.8), new Color("#f9423a", 1)];
    widget.backgroundGradient = gradient;

    const logoImage = await loadImage(
      "https://d1quwwdmdfumn6.cloudfront.net/t3n/2018/images/logos/t3n_logo_420x420.png"
    );
    const logo = widget.addImage(logoImage);
    logo.imageSize = new Size(40, 40);

    widget.addSpacer();

    const titleText = widget.addText(title);
    titleText.font = Font.boldSystemFont(14);
    titleText.textColor = Color.white();

    widget.addSpacer();

    widget.url = url;

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
