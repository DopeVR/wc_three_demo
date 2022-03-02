export function makeRandomString(length: number): string {
  let text: string = '';
  const char_list: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < length; i++) {
    text += char_list.charAt(Math.floor(Math.random() * char_list.length));
  }
  return text;
}

export function generateUUID(): string {
  let newUUID: string = '';
  newUUID += this.makeRandomString(8);
  newUUID += '-';
  newUUID += this.makeRandomString(4);
  newUUID += '-';
  newUUID += this.makeRandomString(4);
  newUUID += '-';
  newUUID += this.makeRandomString(4);
  newUUID += '-';
  newUUID += this.makeRandomString(12);
  return (newUUID);
}
