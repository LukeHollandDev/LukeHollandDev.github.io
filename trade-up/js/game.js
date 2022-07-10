class Game {
  constructor(data = []) {
    this.inProgress = false; // starts after user pressed play
    this.time = 0; // seconds
    this.currentItem = null;
    this.currentOffers = null;
    this.trades = 0;
    this.productData = data.items;
    this.dataIndex = 0;
  }

  getOffers() {
    let offers = [];
    let data = this.productData;

    // get two low value items
    let min = parseInt(this.dataIndex - 0.1 * data.length);
    min = min < 0 ? 0 : min;
    let index = Math.floor(Math.random() * (this.dataIndex - min) + min)
    offers.push(new Item(data[index].name, data[index].price, data[index].image, index));
    data.splice(index, 1);
    min = parseInt(this.dataIndex - 0.2 * data.length);
    min = min < 0 ? 0 : min;
    index = Math.floor(Math.random() * (this.dataIndex - min) + min)
    offers.push(new Item(data[index].name, data[index].price, data[index].image, index));
    data.splice(index, 1);
    this.productData.splice(index, 1);

    // get one guarenteed higher
    min = this.dataIndex + 1;
    let max = parseInt(Math.abs(min + 0.4 * data.length));
    max = data.length < max ? data.length : max;
    index = Math.floor(Math.random() * (max - min) + min)
    offers.push(new Item(data[index].name, data[index].price, data[index].image, index));
    data.splice(index, 1);
    this.productData.splice(index, 1);

    // get one thats close to the currentItem/dataIndex
    let mid = min;
    min = parseInt(mid * 0.95);
    max = parseInt(mid * 1.2);
    max = data.length < max ? data.length : max;
    index = Math.floor(Math.random() * (max - min) + min)
    offers.push(new Item(data[index].name, data[index].price, data[index].image, index));
    data.splice(index, 1);
    this.productData.splice(index, 1);

    offers = shuffle(offers);

    return offers;
  }

  start() {
    this.inProgress = true;
    this.time = -1;
    this.trades = 0;
    this.currentItem = new Item('£1 Coin', 1.00, 'https://d3h9wgial7chxw.cloudfront.net/products/1921/main/2017-base-metal-bu-nations-of-the-crown-1-coin-single-united-kingdom-the-royal-mint-2.jpg')
    this.dataIndex = parseInt(data.items.length * 0.01 );
    this.currentOffers = this.getOffers();
  }

  selectItem(index) {
    // user selects item update their current to that new item
    this.currentItem = this.currentOffers[index];
    this.dataIndex = this.currentItem.index;
    // get new offers and increment the move counter update the dataIndex
    this.currentOffers = this.getOffers();
    this.trades++;
  }
}
