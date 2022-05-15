public with sharing class CourseCtrl {
    public CourseCtrl() {

    }

    @AuraEnabled(Cacheable = true)
    public static List<Course__c> getCourseByUser(){
        // if System Admin -> return all
        if (ProfileCtrl.isSystemAdmin()) {
            return [
                SELECT Id, Name, Description__c, Faculty__r.Name, Coordinator__r.Name, Status__c
                FROM Course__c
            ];
        }

        if (ProfileCtrl.isFacultyAdmin()) {
            // Get current Faculty
            List<String> faculties = FacultyCtrl.getFacultyIdManagedByUser(); 

            return [
                SELECT Id, Name, Description__c, Faculty__r.Name, Coordinator__r.Name, Status__c
                FROM Course__c
                WHERE Faculty__r.Id IN :faculties
            ];
        }

        return getCourseManagedByUser();
    }

    @AuraEnabled(Cacheable = true)
    public static List<Course__c> getCourseManagedByUser(){
        String userId = UserInfo.getUserId();
        
        return [
            SELECT Id, Name, Description__c, Faculty__r.Name, Coordinator__r.Name, Status__c
            FROM Course__c
            WHERE Coordinator__r.Id = :userId
        ];
    }
}