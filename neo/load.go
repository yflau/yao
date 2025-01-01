package neo

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"github.com/yaoapp/gou/application"
	"github.com/yaoapp/yao/config"
	"github.com/yaoapp/yao/neo/assistant"
	"github.com/yaoapp/yao/neo/store"
)

// Neo the neo AI assistant
var Neo *DSL

// Load load AIGC
func Load(cfg config.Config) error {

	setting := DSL{
		ID:      "neo",
		Prompts: []assistant.Prompt{},
		Option:  map[string]interface{}{},
		Allows:  []string{},
		StoreSetting: store.Setting{
			Table:     "yao_neo_conversation",
			Connector: "default",
		},
	}

	bytes, err := application.App.Read(filepath.Join("neo", "neo.yml"))
	if err != nil {
		return err
	}

	err = application.Parse("neo.yml", bytes, &setting)
	if err != nil {
		return err
	}

	if setting.StoreSetting.MaxSize == 0 {
		setting.StoreSetting.MaxSize = 100
	}

	Neo = &setting

	// Store Setting
	err = Neo.createStore()
	if err != nil {
		return err
	}

	// Load Built-in Assistants
	assistant.SetStorage(Neo.Store)
	err = assistant.LoadBuiltIn()
	if err != nil {
		return err
	}

	// Query Assistant List
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	listDone := make(chan error, 1)
	go func() {
		list, err := Neo.HookAssistants(ctx, assistant.QueryParam{Limit: 100})
		Neo.updateAssistantList(list)
		listDone <- err
	}()

	select {
	case err := <-listDone:
		if err != nil {
			return fmt.Errorf("Neo assistant list failed: %w", err)
		}

		// Create Default Assistant
		Neo.Assistant, err = Neo.createDefaultAssistant()
		if err != nil {
			return err
		}

		return nil
	case <-ctx.Done():
		return fmt.Errorf("Neo assistant list timeout: %w", ctx.Err())
	}

}
