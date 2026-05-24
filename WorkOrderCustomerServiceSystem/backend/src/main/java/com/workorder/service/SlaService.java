package com.workorder.service;

import com.workorder.entity.Ticket;
import java.util.List;

public interface SlaService {

    void calculateSlaDeadline(Ticket ticket);

    void checkSlaWarning();

    void checkSlaOverdue();

    List<Ticket> getWarningTickets();

    List<Ticket> getOverdueTickets();
}