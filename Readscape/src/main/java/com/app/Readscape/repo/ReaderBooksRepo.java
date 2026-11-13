package com.app.Readscape.repo;

import com.app.Readscape.entity.ReaderBooks;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReaderBooksRepo extends JpaRepository<ReaderBooks, Long> {

    List<ReaderBooks> findByUserId(Long userId);

    boolean existsByUserId(Long user_id);

    boolean existsByUserIdandBookId(Long userId, Long bookId);
    
} 
