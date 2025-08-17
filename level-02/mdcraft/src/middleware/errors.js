export function notFound(req, res) {
  res.status(404).render('404', { title: 'Not Found' });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  res.status(500).render('404', { title: 'Server Error' });
}
