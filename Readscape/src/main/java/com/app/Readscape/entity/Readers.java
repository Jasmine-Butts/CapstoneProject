package com.app.Readscape.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "readers")
public class Readers {
   
    @Id
    @Column(name = "reader_id")
    private Long readerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "reader_id")
    private UserAccount userAccount;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_img_url")
    private String profileImgUrl;

    @Column(name = "reading_goal")
    private Integer readingGoal;

    @Column(name = "preferred_genre")
    private String preferredGenre;

    @Column(name = "profile_visibility")
    private Boolean profileVisibility;

    // setters and getters 

    public Long getReaderId(){
        return readerId;
    }

    public void setReaderId(Long readerId) {
        this.readerId = readerId;
    }


    public UserAccount getUserAccount(){
        return userAccount;
    }

    public void setUserAccount(UserAccount userAccount){
        this.userAccount = userAccount;
    }

    public String getBio(){
        return bio;
    }

    public void setBio(String bio){
        this.bio = bio;
    }

    public String getProfileImgUrl(){
        return profileImgUrl;
    }

    public void setProfileImgUrl(String profileImgUrl){
        this.profileImgUrl = profileImgUrl;
    }

    public Integer getReadingGoal(){
        return readingGoal;
    }

    public void setReadingGoal(Integer readingGoal){
        this.readingGoal = readingGoal;
    }

    public String getPreferredGenre(){
        return preferredGenre;
    }

    public void setPreferredGenre(String preferredGenre){
        this.preferredGenre = preferredGenre;
    }

    public Boolean getProfileVisibility(){
        return profileVisibility;
    }

    public void setProfileVisibility(Boolean profileVisibility){
        this.profileVisibility = profileVisibility;
    }

}
