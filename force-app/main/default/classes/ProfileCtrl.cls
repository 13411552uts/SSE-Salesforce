public with sharing class ProfileCtrl {
    public ProfileCtrl() {

    }

    public static String getProfileNameByUser() {
        return [
            SELECT Name 
            FROM Profile
            WHERE Id = :UserInfo.getProfileId()
        ].Name;
    }

    public static Boolean isSystemAdmin() {
        // Get profile name
        String profileName = getProfileNameByUser();

        return profileName == 'System Administrator';
    }

    public static Boolean isFacultyAdmin() {
        // Get profile name
        String profileName = getProfileNameByUser();

        return profileName == 'Faculty Administrator';
    }
    
    public static Boolean isCourseCoordinator() {
        // Get profile name
        String profileName = getProfileNameByUser();

        return profileName == 'Course Coordinator'; 
    }
}