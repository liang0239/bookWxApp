const baseUrl = 'https://jeremygao.net/';

const getBooksUrl = baseUrl + 'api/book/getBooks';
const commentUrl = baseUrl + 'api/comment/write';
const queryBookUrl = baseUrl + 'api/book/queryBook';
const loginUrl = baseUrl + 'login';


module.exports = {
	getBooksUrl: getBooksUrl,
	commentUrl: commentUrl,
	queryBookUrl: queryBookUrl,
	loginUrl: loginUrl
};