public with sharing class StudentCtrl {
    public StudentCtrl() {

    }

    @AuraEnabled(Cacheable = true)
    public static List<Student__c> getStudents() {
        return [
            SELECT Id, Name, Description__c, Course__r.Name, Faculty__r.Name, dob__c, ApplicationStatus__c, FacultyApprovalStatus__c
            FROM Student__c
        ];
    }
}
