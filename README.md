## Assumptions

- The input CSV file is **UTF-8 encoded** and contains headers in the first row only.
- Mandatory fields viz **`name.firstName`, `name.lastName`, `age`** are always present.
- Empty or missing values are ignored in the generated JSON.
- Address fields are identified by the `address.` and grouped into a JSONB column.
- Unknown or dynamic columns are stored in `additional_info` to keep the schema flexible.
- Age distribution calculation done on every entry by assigning a varibale to the count.
  
