package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type SecurityLog struct {
	ID          string `json:"id"`
	Timestamp   string `json:"timestamp"`
	UnixTime    int64  `json:"unixTime"`
	AttackType  string `json:"attackType"`
	SourceIP    string `json:"sourceIp"`
	Severity    string `json:"severity"`
	Description string `json:"description"`
	Submitter   string `json:"submitter"`
}

type PaginatedLogs struct {
	Logs     []*SecurityLog `json:"logs"`
	Bookmark string         `json:"bookmark"`
}

type HistoryRecord struct {
	TxID      string       `json:"txId"`
	Timestamp string       `json:"timestamp"`
	Record    *SecurityLog `json:"record"`
}

const severityIndex = "severity~id"

func (s *SmartContract) CreateLog(ctx contractapi.TransactionContextInterface, attackType, sourceIP, severity, description string) error {
	if len(attackType) == 0 || len(sourceIP) == 0 || len(severity) == 0 {
		return fmt.Errorf("attackType, sourceIP e severity sono obbligatori")
	}
	mspID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("impossibile ottenere l'MSP ID del client: %v", err)
	}
	now := time.Now().UTC()
	log := SecurityLog{
		ID:          uuid.New().String(),
		Timestamp:   now.Format(time.RFC3339),
		UnixTime:    now.Unix(),
		AttackType:  attackType,
		SourceIP:    sourceIP,
		Severity:    severity,
		Description: description,
		Submitter:   mspID,
	}
	logJSON, err := json.Marshal(log)
	if err != nil {
		return fmt.Errorf("errore marshal log: %v", err)
	}
	if err := ctx.GetStub().PutState(log.ID, logJSON); err != nil {
		return fmt.Errorf("errore PutState: %v", err)
	}
	idxKey, err := ctx.GetStub().CreateCompositeKey(severityIndex, []string{severity, log.ID})
	if err != nil {
		return fmt.Errorf("errore CreateCompositeKey: %v", err)
	}
	if err := ctx.GetStub().PutState(idxKey, []byte{0}); err != nil {
		return fmt.Errorf("errore PutState index: %v", err)
	}
	eventPayload, _ := json.Marshal(map[string]string{"id": log.ID, "severity": severity})
	_ = ctx.GetStub().SetEvent("SecurityLogCreated", eventPayload)
	return nil
}

func (s *SmartContract) ReadLog(ctx contractapi.TransactionContextInterface, id string) (*SecurityLog, error) {
	if len(id) == 0 {
		return nil, fmt.Errorf("ID non può essere vuoto")
	}
	data, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("errore GetState: %v", err)
	}
	if data == nil {
		return nil, fmt.Errorf("log %s non trovato", id)
	}
	var log SecurityLog
	if err := json.Unmarshal(data, &log); err != nil {
		return nil, fmt.Errorf("errore Unmarshal: %v", err)
	}
	return &log, nil
}

func (s *SmartContract) UpdateLog(ctx contractapi.TransactionContextInterface, id, attackType, sourceIP, severity, description string) error {
	logRec, err := s.ReadLog(ctx, id)
	if err != nil {
		return err
	}
	if severity != logRec.Severity {
		oldIdx, _ := ctx.GetStub().CreateCompositeKey(severityIndex, []string{logRec.Severity, logRec.ID})
		_ = ctx.GetStub().DelState(oldIdx)
	}
	now := time.Now().UTC()
	logRec.AttackType = attackType
	logRec.SourceIP = sourceIP
	logRec.Severity = severity
	logRec.Description = description
	logRec.Timestamp = now.Format(time.RFC3339)
	logRec.UnixTime = now.Unix()
	data, _ := json.Marshal(logRec)
	if err := ctx.GetStub().PutState(id, data); err != nil {
		return fmt.Errorf("errore PutState update: %v", err)
	}
	newIdx, _ := ctx.GetStub().CreateCompositeKey(severityIndex, []string{severity, logRec.ID})
	_ = ctx.GetStub().PutState(newIdx, []byte{0})
	return nil
}

func (s *SmartContract) DeleteLog(ctx contractapi.TransactionContextInterface, id string) error {
	logRec, err := s.ReadLog(ctx, id)
	if err != nil {
		return err
	}
	_ = ctx.GetStub().DelState(id)
	idx, _ := ctx.GetStub().CreateCompositeKey(severityIndex, []string{logRec.Severity, logRec.ID})
	_ = ctx.GetStub().DelState(idx)
	return nil
}

func (s *SmartContract) GetLogsBySeverity(ctx contractapi.TransactionContextInterface, severity string) ([]*SecurityLog, error) {
	if len(severity) == 0 {
		return nil, fmt.Errorf("severity non può essere vuota")
	}
	iter, err := ctx.GetStub().GetStateByPartialCompositeKey(severityIndex, []string{severity})
	if err != nil {
		return nil, fmt.Errorf("errore GetStateByPartialCompositeKey: %v", err)
	}
	defer iter.Close()
	var logs []*SecurityLog
	for iter.HasNext() {
		r, _ := iter.Next()
		_, parts, _ := ctx.GetStub().SplitCompositeKey(r.Key)
		rec, _ := s.ReadLog(ctx, parts[1])
		logs = append(logs, rec)
	}
	return logs, nil
}

func (s *SmartContract) GetAllLogs(ctx contractapi.TransactionContextInterface) ([]*SecurityLog, error) {
	iter, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("GetStateByRange: %v", err)
	}
	defer iter.Close()
	var logs []*SecurityLog
	for iter.HasNext() {
		r, _ := iter.Next()
		if strings.HasPrefix(r.Key, severityIndex) {
			continue
		}
		var rec SecurityLog
		_ = json.Unmarshal(r.Value, &rec)
		logs = append(logs, &rec)
	}
	return logs, nil
}

func (s *SmartContract) GetLogsByTimeRange(ctx contractapi.TransactionContextInterface, startUnix, endUnix int64) ([]*SecurityLog, error) {
	all, err := s.GetAllLogs(ctx)
	if err != nil {
		return nil, err
	}
	var filtered []*SecurityLog
	for _, log := range all {
		if log.UnixTime >= startUnix && log.UnixTime <= endUnix {
			filtered = append(filtered, log)
		}
	}
	return filtered, nil
}

func (s *SmartContract) GetLogsBySubmitter(ctx contractapi.TransactionContextInterface, mspID string) ([]*SecurityLog, error) {
	iter, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer iter.Close()
	var filtered []*SecurityLog
	for iter.HasNext() {
		r, _ := iter.Next()
		if strings.HasPrefix(r.Key, severityIndex) {
			continue
		}
		var rec SecurityLog
		_ = json.Unmarshal(r.Value, &rec)
		if rec.Submitter == mspID {
			filtered = append(filtered, &rec)
		}
	}
	return filtered, nil
}

func (s *SmartContract) GetAllLogsPaginated(ctx contractapi.TransactionContextInterface, pageSize int32, bookmark string) (*PaginatedLogs, error) {
	results, meta, err := ctx.GetStub().GetStateByRangeWithPagination("", "", pageSize, bookmark)
	if err != nil {
		return nil, err
	}
	defer results.Close()
	var logs []*SecurityLog
	for results.HasNext() {
		r, _ := results.Next()
		if strings.HasPrefix(r.Key, severityIndex) {
			continue
		}
		var rec SecurityLog
		_ = json.Unmarshal(r.Value, &rec)
		logs = append(logs, &rec)
	}
	return &PaginatedLogs{Logs: logs, Bookmark: meta.Bookmark}, nil
}

func (s *SmartContract) GetLogHistory(ctx contractapi.TransactionContextInterface, id string) ([]*HistoryRecord, error) {
	results, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, err
	}
	defer results.Close()
	var history []*HistoryRecord
	for results.HasNext() {
		r, _ := results.Next()
		var rec SecurityLog
		_ = json.Unmarshal(r.Value, &rec)
		history = append(history, &HistoryRecord{TxID: r.TxId, Timestamp: time.Unix(r.Timestamp.Seconds, int64(r.Timestamp.Nanos)).UTC().Format(time.RFC3339), Record: &rec})
	}
	return history, nil
}

func (s *SmartContract) CountBySeverity(ctx contractapi.TransactionContextInterface) (map[string]int, error) {
	iter, err := ctx.GetStub().GetStateByPartialCompositeKey(severityIndex, []string{})
	if err != nil {
		return nil, fmt.Errorf("errore GetStateByPartialCompositeKey: %v", err)
	}
	defer iter.Close()
	counts := make(map[string]int)
	for iter.HasNext() {
		r, err := iter.Next()
		if err != nil {
			return nil, err
		}
		_, parts, err := ctx.GetStub().SplitCompositeKey(r.Key)
		if err != nil {
			continue
		}
		severity := parts[0]
		counts[severity]++
	}
	return counts, nil
}

func (s *SmartContract) CountByAttackType(ctx contractapi.TransactionContextInterface) (map[string]int, error) {
	all, err := s.GetAllLogs(ctx)
	if err != nil {
		return nil, err
	}
	counts := make(map[string]int)
	for _, log := range all {
		counts[log.AttackType]++
	}
	return counts, nil
}

func (s *SmartContract) PurgeLogsByTime(ctx contractapi.TransactionContextInterface, olderThanUnix int64) error {
	all, err := s.GetAllLogs(ctx)
	if err != nil {
		return err
	}
	for _, log := range all {
		if log.UnixTime < olderThanUnix {
			_ = ctx.GetStub().DelState(log.ID)
			idx, _ := ctx.GetStub().CreateCompositeKey(severityIndex, []string{log.Severity, log.ID})
			_ = ctx.GetStub().DelState(idx)
		}
	}
	return nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		panic(fmt.Errorf("errore creazione chaincode: %v", err))
	}
	if err := chaincode.Start(); err != nil {
		panic(fmt.Errorf("errore avvio chaincode: %v", err))
	}
}
