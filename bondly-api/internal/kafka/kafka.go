package kafka

import (
	"bondly-api/config"
	"encoding/json"
	"fmt"

	"github.com/Shopify/sarama"
)

type KafkaProducer struct {
	producer sarama.SyncProducer
	config   config.KafkaConfig
}

type KafkaConsumer struct {
	consumer sarama.Consumer
	config   config.KafkaConfig
}

// NewProducer 创建Kafka生产者
func NewProducer(cfg config.KafkaConfig) (*KafkaProducer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5

	producer, err := sarama.NewSyncProducer(cfg.Brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create kafka producer: %v", err)
	}

	return &KafkaProducer{
		producer: producer,
		config:   cfg,
	}, nil
}

// NewConsumer 创建Kafka消费者
func NewConsumer(cfg config.KafkaConfig) (*KafkaConsumer, error) {
	consumer, err := sarama.NewConsumer(cfg.Brokers, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create kafka consumer: %v", err)
	}

	return &KafkaConsumer{
		consumer: consumer,
		config:   cfg,
	}, nil
}

// SendMessage 发送消息
func (k *KafkaProducer) SendMessage(topic string, message interface{}) error {
	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %v", err)
	}

	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.StringEncoder(jsonData),
	}

	partition, offset, err := k.producer.SendMessage(msg)
	if err != nil {
		return fmt.Errorf("failed to send message: %v", err)
	}

	fmt.Printf("Message sent to topic(%s)/partition(%d)/offset(%d)\n", topic, partition, offset)
	return nil
}

// Close 关闭生产者
func (k *KafkaProducer) Close() error {
	return k.producer.Close()
}

// ConsumeMessages 消费消息
func (k *KafkaConsumer) ConsumeMessages(topic string, handler func([]byte) error) error {
	partitionConsumer, err := k.consumer.ConsumePartition(topic, 0, sarama.OffsetNewest)
	if err != nil {
		return fmt.Errorf("failed to create partition consumer: %v", err)
	}
	defer partitionConsumer.Close()

	for message := range partitionConsumer.Messages() {
		if err := handler(message.Value); err != nil {
			fmt.Printf("Error handling message: %v\n", err)
		}
	}

	return nil
}

// Close 关闭消费者
func (k *KafkaConsumer) Close() error {
	return k.consumer.Close()
}
