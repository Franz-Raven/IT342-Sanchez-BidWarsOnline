package edu.cit.sanchez.bidwarsonline.features.plinko.dto;

public class PlinkoConfig {
    private String risk;
    private Integer rows;

    public PlinkoConfig() {
    }

    public PlinkoConfig(String risk, Integer rows) {
        this.risk = risk;
        this.rows = rows;
    }

    public String getRisk() {
        return risk;
    }

    public void setRisk(String risk) {
        this.risk = risk;
    }

    public Integer getRows() {
        return rows;
    }

    public void setRows(Integer rows) {
        this.rows = rows;
    }
}





