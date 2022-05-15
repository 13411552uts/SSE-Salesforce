public with sharing class TestClass {
  public List<Account> accounts {get; set;}
  public Account currentRecord {get; set;}
  public String searchString {get; set;}

  public TestClass() {  }

  public void searchAccount() {
    // Init list accounts
    accounts = new List<Account>();

    if (String.isNotBlank(searchString)) {
      // Gen cond string from searchString
      String likeCond = '%' + searchString + '%';
      
      accounts = [
        SELECT Id, Name, Owner.Name 
        FROM Account 
        WHERE Name LIKE :likeCond
      ];
    }
  }

  public void deleteAccount() {

  }

  public void getAccountById() {

  }

  public void saveAccount() {

  }
}