public with sharing class AccountCtrl {
    public AccountCtrl() {

    }

    @AuraEnabled(Cacheable = true)
    public static List<User> getAllAccount(){
        return [
            SELECT Id, Name
            FROM User
        ];
    }
}
