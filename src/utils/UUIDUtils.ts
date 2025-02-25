function generateUUID(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        id += letters[randomIndex];
    }
    return id;
}

export {
  generateUUID
}
