// This app never touches money -- these just build a link that opens the
// owner's own Venmo/Cash App/PayPal with an amount pre-filled where that
// service supports it. The actual transaction happens entirely in their
// app/site; nothing here talks to a payment API.
export function venmoLink(handle, amountDollars, note) {
  return `https://venmo.com/${encodeURIComponent(handle)}?txn=pay&amount=${amountDollars}&note=${encodeURIComponent(note)}`;
}

// Cash App's amount-prefilled "Payment Links" are generated inside the app
// itself, not via a documented URL parameter -- this just opens the
// person's $cashtag page.
export function cashAppLink(handle) {
  return `https://cash.app/$${encodeURIComponent(handle)}`;
}

export function paypalLink(handle, amountDollars) {
  return `https://paypal.me/${encodeURIComponent(handle)}/${amountDollars}`;
}
