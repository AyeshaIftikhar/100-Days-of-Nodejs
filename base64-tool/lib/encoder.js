class Base64Encoder {
  static encode(text, urlSafe = false) {
    if (typeof text !== 'string') {
      throw new Error('Input must be a string');
    }
    
    const encoded = Buffer.from(text).toString('base64');
    return urlSafe 
      ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      : encoded;
  }

  static decode(encoded, urlSafe = false) {
    if (typeof encoded !== 'string') {
      throw new Error('Input must be a string');
    }

    let prepared = encoded;
    if (urlSafe) {
      prepared = prepared.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (prepared.length % 4) {
        prepared += '=';
      }
    }

    return Buffer.from(prepared, 'base64').toString('utf8');
  }
}

module.exports = Base64Encoder;