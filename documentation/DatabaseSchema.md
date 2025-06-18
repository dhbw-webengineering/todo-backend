
## **Database Schema**

### **Users**

| Field    | Type    | Description     |
| :------- | :------ | :-------------- |
| user_id  | PK      | Unique user ID  |
| email    | VARCHAR | User email      |
| password | VARCHAR | Hashed password |


---

### **Categories**

| Field       | Type    | Description        |
| :---------- | :------ | :----------------- |
| category_id | PK      | Unique category ID |
| user_id     | FK      | Reference to user  |
| name        | VARCHAR | Category name      |


---

### **Todos**

| Field        | Type     | Description                   |
| :----------- | :------- | :---------------------------- |
| todo_id      | PK       | Unique todo ID                |
| user_id      | FK       | Reference to user             |
| title        | VARCHAR  | Todo title                    |
| description  | TEXT     | Todo description              |
| due_date     | DATETIME | Due date                      |
| category_id  | FK       | Reference to category         |
| completed_at | DATETIME | Timestamp when completed/null |
| created_at   | DATETIME | Creation timestamp            |
| updated_at   | DATETIME | Last modification timestamp   |


---

### **Tags**

| Field   | Type    | Description       |
| :------ | :------ | :---------------- |
| tag_id  | PK      | Unique tag ID     |
| user_id | FK      | Reference to user |
| name    | VARCHAR | Tag name          |


---

### **Todo_Tags** (Join Table)

| Field   | Type | Description       |
| :------ | :--- | :---------------- |
| todo_id | FK   | Reference to todo |
| tag_id  | FK   | Reference to tag  |
