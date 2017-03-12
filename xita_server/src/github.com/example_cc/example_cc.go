/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main


import (
	"fmt"
	"encoding/json"
    "strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type User struct {
    UserName string
    PassWord string
    Email  string
    PublishCount int
    Coin int
}

type Article struct {
    ID string
    Title string
    Content string
    ImgUrl string
    ReviewedCount int
    UserName  string
}

/*type Comments struct {
     content string
     author User
}*/



func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response  {
        fmt.Println("########### example_cc Init ###########")
	/*_, args := stub.GetFunctionAndParameters()
	var A, B string    // Entities
	var Aval, Bval int // Asset holdings
	var err error

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	// Initialize the chaincode
	A = args[0]
	Aval, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	B = args[2]
	Bval, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	fmt.Printf("Aval = %d, Bval = %d\n", Aval, Bval)

	// Write the state to the ledger
	err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
	if err != nil {
		return shim.Error(err.Error())
	}*/

	return shim.Success(nil)

}

func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {
		return shim.Error("Unknown supported call")
}

// Transaction makes payment of X units from A to B
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
        fmt.Println("########### example_cc Invoke ###########")
	function, args := stub.GetFunctionAndParameters()
	
	if function != "invoke" {
                return shim.Error("Unknown function call")
	}

	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting at least 2")
	}

	/*if args[0] == "delete" {
		// Deletes an entity from its state
		return t.delete(stub, args)
	}

	if args[0] == "query" {
		// queries an entity state
		return t.query(stub, args)
	}
	if args[0] == "move" {
		// Deletes an entity from its state
		return t.move(stub, args)
	}
	return shim.Error("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'")*/

	if args[0] == "register" {

		return t.register(stub,args)
	}

	if args[0]  == "publish" {
		return t.publish(stub, args)
	}

	if args[0] == "review" {
	    return t.review(stub, args)
	}

	if args[0] == "getartical" {
		return t.getartical(stub, args)
	}

	if args[0] == "getuser" {
		return t. getuser(stub, args)
	}
    if args[0] == "getarticalbyrange" {
        return t.getarticalbyrange(stub, args)
    }
    if args[0] == "addsubcoin" {
        return t.addsubcoin(stub, args)
    }
    return shim.Error("Unknown action, check the first argument")
}


func (t *SimpleChaincode) addsubcoin (stub shim.ChaincodeStubInterface, args []string) pb.Response {

    username :=args[1]
    operation :=args[2]
    coin :=args[3]

    user, err := get_user(stub, username)
    if err != nil {
        return shim.Error("addsubcoin error")
    }
    if operation == "add" {
        x,_:=strconv.Atoi(coin)
        user.Coin += x
    } else if operation == "sub" {
        x,_ :=strconv.Atoi(coin)
        user.Coin -=x
        if user.Coin < 0 {
            user.Coin =0
        }
    } else {
        return shim.Error("no supproted operation only 'and' or 'sub'")
    }
    err = write_user(stub, user)
    if err != nil {
        return shim.Error("addsubcoin wirte user error")
    }
    return shim.Success([]byte(strconv.Itoa(user.Coin)))
}

func (t *SimpleChaincode) review (stub shim.ChaincodeStubInterface, args []string) pb.Response{
	
    var author User
	artical_id := args[1]
       
    artical, err := get_artical(stub, artical_id)
    if err != nil {
    	return shim.Error("review getstate error")
    }
    
    author,err = get_user(stub, artical.UserName)
    if err != nil {
    	return shim.Error("review get user error")
    }
    artical.ReviewedCount +=1
    author.Coin +=10
    err = write_artile(stub, artical)
    if err != nil {
    	return shim.Error("review write artical error")
    }
    err = write_user(stub, author)
    if err !=nil {
    	return shim.Error ("review write author error")
    }
    return shim.Success(nil)
    
    
}

func get_artical (stub shim.ChaincodeStubInterface, artical_id string) (Article, error) {
	var artical Article

	articalBytes, err := stub.GetState(artical_id)
	if err != nil {
        return artical , err
      }
     if articalBytes == nil {
     	return artical, nil

     } 
     err = json.Unmarshal(articalBytes, &artical)
     if err != nil {
     	return artical , err
     } 
     return artical , nil

}

func get_user ( stub shim.ChaincodeStubInterface,user_name string ) (User, error) {
	var user User

	userBytes, err :=stub.GetState(user_name)
    if err != nil {
        return user , err
      }
     if userBytes == nil {
     	return user , err

     } 
     err = json.Unmarshal(userBytes, &user)
     if err != nil {
     	return user , err
     } 
     fmt.Println(user)
     return user , nil
}


func (t *SimpleChaincode) publish (stub shim.ChaincodeStubInterface, args []string) pb.Response{

    user_name := args[1]
    tile :=args[2]
    content := args[3]
    url := args[4]
    id :=args[5]

    var user User

    article := Article{UserName:user_name, Title:tile,Content:content,ImgUrl:url,ID:id}
    userBytes, err :=stub.GetState(article.UserName)
    if err != nil {
       return shim.Error("Failed to get state")
      }
     //if userBytes == nil {
     	//return shim.Error("Can not get the user please reigster first")

     //bb} 
     	
     err = write_artile(stub, article)
     if err != nil {
     	    return shim.Error("publish error")
     }

     err = json.Unmarshal(userBytes, &user)
     if err != nil {
     		return shim.Error("json ummarshal error" )
     }
     user.Coin +=50
     user.PublishCount +=1

     err = write_user(stub, user )
     if err != nil {
            return shim.Error("publish write user error" )
     }
     return shim.Success(nil)
   
}


func write_artile(stub shim.ChaincodeStubInterface, article Article) error {
    
    articleBytes,err := json.Marshal(&article)
    if err != nil {
    	return err
    }
    err = stub.PutState(article.ID, articleBytes)
    if err != nil {
    	return err
    }
    return nil
}


func (t *SimpleChaincode) register (stub shim.ChaincodeStubInterface, args []string) pb.Response{

    var user User
 
    user =User{UserName:args[1], PassWord:args[2],Email:args[3]}

    userBytes, err := stub.GetState(user.UserName)
    if err != nil {
		return shim.Error("Failed to get state")
	}
	if userBytes != nil {
		return shim.Error("User already exist")
	}
	err = write_user(stub, user)
    if err != nil {
    	return shim.Error("register write user error")
    }
    return shim.Success(nil)
}


func write_user(stub shim.ChaincodeStubInterface, user User) error {

    userBytes,err := json.Marshal(&user)
    if err != nil {
    	return err
    }
    err = stub.PutState(user.UserName, userBytes)
    if err !=nil {
    	return err
    }
    return nil
}


// Query callback representing the query of a chaincode
func (t *SimpleChaincode) getartical (stub shim.ChaincodeStubInterface, args []string) pb.Response {
    
    articalBytes, err := stub.GetState(args[1])
    if err != nil {
    	return shim.Error("getartical get artical error")
    }

    return shim.Success(articalBytes)
}

func (t *SimpleChaincode) getuser (stub shim.ChaincodeStubInterface, args []string) pb.Response {

    userBytes, err := stub.GetState(args[1])
    if err != nil {
    	return shim.Error("getuser get user error")
    }
    return shim.Success(userBytes)
}

func (t *SimpleChaincode ) getarticalbyrange (stub shim.ChaincodeStubInterface, args []string) pb.Response {
    var articals [] Article
    for _, key := range args {
        artical,_:= get_artical(stub,key)
        articals = append(articals, artical)
    }
    articalBytes,err := json.Marshal(articals)
    if err !=nil {
        return shim.Error("get aticals error")
    }
    return shim.Success(articalBytes)
}


func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
