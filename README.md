# Library-Managemet

# Main Entities
1. users 
2. books 
3. borrowings

### Users
* Data schema
	* **id** : number
	* **name** : string
	* **email** : string
	* **is_active** : boolean
	* **password** : string
	* **hashedRt** : string
	* **created_at** : date
	* **updated_at** : date
* Exposed Endpoints:

  * [GET] /api/v1/users?paging[page]=1&paging[per_page]=20
  <code>**description**: Get All users paginated</code>

  * [GET] /api/v1/users/[userId]
  <code>**description**: Get single user by id</code>

  * [DELETE] /api/v1/users/[userId]
  <code>**description**: Delete single user by id</code>

  * [POST] /api/v1/users/[userId]/borrow
  <code>**description**:  let user borrow one or more books</code>
   **body**
   ```json
{
        "borrowings": [
            {
                "book_id": 2,
                "due_date": "2024-08-07T21:00:00.000Z"
            },
            {
                "book_id": 3,
                "due_date": "2024-08-07T21:00:00.000Z"
            }
        ]
}
```

  * [POST] /api/v1/users/[userId]/return
  <code>**description**:  let user return one or more books that they already borrowed</code>
  **body**
  ```json
{
        "books": [
            1,
            3
        ]
}
```



### Books
* Data schema
	* **id** : number
	* **title** : string
	* **author** : string
	* **isbn**: number
	* **total_quantity** :  number
	* **available_quantity** :  number
	* **shelf_location** : string
	* **created_at** : date
	* **updated_at** : date

* Exposed Endpoints
  * [POST] /api/v1/books
    <code>**description**: Create single book</code>
	  **body**
	  ```json
{
      "title": "book2",
      "author": "author1",
      "isbn": 12345,
      "total_quantity": 10,
      "shelf_location": "d5"
}
```

  * [PATCH] /api/v1/books/[bookId]
  <code>**description**: Update single book</code>
    **body**
      ```yaml
      {
        "title": "book2",
        "author": "author1",
        "isbn": 12345,
        "total_quantity": 10,
        "available_quantity": 10,
        "shelf_location": "d5"
        }
      ```

  * [GET] /api/v1/books? paging[page]=1&paging[per_page]=20&filters[is_overdue]=true&filters[is_overdue]=true&filters[author]=[author]&filters[title]=[title]&filters[isbn]=[isbn]
  
    <code> **description**: Get All books paginated with options to filter data</code>
	
	<code> **Available FIlters: **</code>
	  ```json
 author: string
 title: string
 isbn: number
 overdue books: true | false
```

  * [GET] /api/v1/books/[bookId]
    <code>**description**: Get single book by id</code>

 * [DELETE] /api/v1/books/[bookId]
    <code>**description**: Delete single book by id</code>


### Borrowings
* Data schema
	* **id** : number
	* **book_id** : number: foreign key ref to **books** table
	* **user_id** : number: foreign key ref to **users** table
	* **is_returned** : boolean
	* **is_returned** : boolean
  * **created_at** : date
	* **updated_at** : date
  * **return_date** : date
	* **due_date** : date

