const baseUrl = 'http://localhost:8081/';

const getBooksUrl = baseUrl + 'api/book/list';
const commentUrl = baseUrl + 'api/comment/add';
const queryBookUrl = baseUrl + 'api/mybook/get';
const loginUrl = baseUrl + 'api/my/login';
const getBoughtBooksUrl = baseUrl + 'api/mybook/list';
const buyBookUrl = baseUrl + 'api/mybook/add';



module.exports = {
	getBooksUrl: getBooksUrl,
	commentUrl: commentUrl,
	queryBookUrl: queryBookUrl,
	loginUrl: loginUrl,
	getBoughtBooksUrl: getBoughtBooksUrl,
	buyBookUrl: buyBookUrl
};