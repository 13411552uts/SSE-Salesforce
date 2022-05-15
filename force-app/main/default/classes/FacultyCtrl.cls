public with sharing class FacultyCtrl {
    @AuraEnabled(Cacheable = true)
    public static List<Faculty__c> getFacultyByUser() {
        // if System Admin -> return all
        if (ProfileCtrl.isSystemAdmin()) {
            return [
                SELECT Id, Name, Description__c, ManagedBy__r.Name, Status__c
                FROM Faculty__c
            ];
        }

        // Not admin -> return assigned only
        return getFacultyManagedByUser();
    }

    @AuraEnabled(Cacheable = true)
    public static List<Faculty__c> getFacultyManagedByUser() {
        if (ProfileCtrl.isFacultyAdmin()) {
            String userId = UserInfo.getUserId();
            return [
                SELECT Id, Name, Description__c, ManagedBy__r.Name, Status__c
                FROM Faculty__c
                WHERE ManagedBy__r.Id = :userId 
            ];
        }

        return [
            SELECT Id, Name, Description__c, ManagedBy__r.Name, Status__c
            FROM Faculty__c
        ];
    }

    @AuraEnabled(Cacheable = true)
    public static List<Faculty__c> getFacultyManagedByUserApproved() {
        String userId = UserInfo.getUserId();
       
        
        return [
            SELECT Id, Name, Description__c, ManagedBy__r.Name, Status__c
            FROM Faculty__c
            WHERE ManagedBy__r.Id = :userId 
            AND Status__c = 'Approved'
        ];
    }

    public static List<String> getFacultyIdManagedByUser() {
        String userId = UserInfo.getUserId();
        List<String> idList = new List<String>();

        for (
            Faculty__c f : 
            [
                SELECT Id
                FROM Faculty__c
                WHERE ManagedBy__r.Id = :userId
            ]   
        ) {
            idList.add(f.Id);
        }

        return idList;
    }
}