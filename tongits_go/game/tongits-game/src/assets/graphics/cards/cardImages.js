const cardImages = {};

const cardNames = [
  '2C', '2D', '2H', '2S',
  '3C', '3D', '3H', '3S',
  '4C', '4D', '4H', '4S',
  '5C', '5D', '5H', '5S',
  '6C', '6D', '6H', '6S',
  '7C', '7D', '7H', '7S',
  '8C', '8D', '8H', '8S',
  '9C', '9D', '9H', '9S',
  '10C', '10D', '10H', '10S',
  'JC', 'JD', 'JH', 'JS',
  'QC', 'QD', 'QH', 'QS',
  'KC', 'KD', 'KH', 'KS',
  'AC', 'AD', 'AH', 'AS',
  'jocker_1'
];

// Create SVG card images
cardNames.forEach(card => {
  const [value, suit] = card.match(/([0-9JQKA]+|jocker_1)([CDHS])?/) || [];
  if (card === 'jocker_1') {
    cardImages[card] = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="70" viewBox="0 0 50 70"><rect width="50" height="70" fill="white" stroke="black"/><text x="25" y="35" text-anchor="middle" dominant-baseline="middle" font-size="12">JOKER</text></svg>`;
  } else {
    const color = suit === 'H' || suit === 'D' ? 'red' : 'black';
    cardImages[card] = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="70" viewBox="0 0 50 70"><rect width="50" height="70" fill="white" stroke="black"/><text x="25" y="35" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="${color}">${value}${suit}</text></svg>`;
  }
});

export default cardImages;