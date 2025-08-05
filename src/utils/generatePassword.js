import generatePassword from 'generate-password';


const generatingPassword = () => {

return generatePassword.generate({
  length: 12,
  numbers: true,
  symbols: true,
  uppercase: true,
  excludeSimilarCharacters: true,
});

};

export default generatingPassword;